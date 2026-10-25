import { StudySessionModel } from '../models/StudySession.js';
import { TaskModel } from '../models/Task.js';
import { SubjectModel } from '../models/Subject.js';
import { UserModel } from '../models/User.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId).lean();
    const tasks = await TaskModel.find({ userId }).lean();
    const sessions = await StudySessionModel.find({ userId }).lean();
    const subjects = await SubjectModel.find({ userId }).lean();

    const targetMinutes = user?.dailyStudyTargetMinutes || 180;

    // 1. Task metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed');

    const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    // 2. Study Session calculations
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

    let todayMinutes = 0;
    let weekMinutes = 0;
    let allTimeMinutes = 0;

    sessions.forEach(s => {
      const sTime = new Date(s.completedAt || s.createdAt).getTime();
      const mins = Number(s.durationMinutes) || 0;
      allTimeMinutes += mins;

      if (sTime >= todayStart) {
        todayMinutes += mins;
      }
      if (sTime >= weekStart) {
        weekMinutes += mins;
      }
    });

    const todayGoalProgress = Math.min(100, Math.round((todayMinutes / targetMinutes) * 100));

    // 3. Last 7 Days Activity (for bar/line chart)
    const last7Days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const daySessions = sessions.filter(s => {
        const t = new Date(s.completedAt || s.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      });

      const dayMins = daySessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);

      last7Days.push({
        date: d.toISOString().split('T')[0],
        dayName: dayNames[d.getDay()],
        minutes: dayMins,
        sessionsCount: daySessions.length
      });
    }

    // 4. Streak Calculation
    let streak = 0;
    let checkDate = new Date(todayStart);

    // If no sessions today yet, check if there was activity yesterday to keep streak alive
    const hadToday = sessions.some(s => new Date(s.completedAt || s.createdAt).getTime() >= todayStart);
    if (!hadToday) {
      checkDate = new Date(todayStart - 24 * 60 * 60 * 1000);
    }

    while (true) {
      const start = checkDate.getTime();
      const end = start + 24 * 60 * 60 * 1000;
      const hasActivity = sessions.some(s => {
        const t = new Date(s.completedAt || s.createdAt).getTime();
        return t >= start && t < end;
      });

      if (hasActivity) {
        streak++;
        checkDate = new Date(start - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }
    // If user studied today, ensure at least 1
    if (hadToday && streak === 0) streak = 1;

    // 5. Subject Distribution (for pie/breakdown)
    const subMap = new Map();
    subjects.forEach(s => subMap.set(s._id || s.id, { name: s.name, code: s.code, color: s.color, minutes: 0 }));

    sessions.forEach(s => {
      if (s.subjectId && subMap.has(s.subjectId)) {
        subMap.get(s.subjectId).minutes += Number(s.durationMinutes) || 0;
      }
    });

    const subjectBreakdown = Array.from(subMap.values());

    // 6. Upcoming deadlines (within next 7 days, not completed)
    const sevenDaysLater = now.getTime() + 7 * 24 * 60 * 60 * 1000;
    const upcomingTasks = tasks
      .filter(t => t.status !== 'completed' && new Date(t.dueDate).getTime() <= sevenDaysLater)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
      .map(t => {
        const sub = subjects.find(s => (s._id || s.id) === t.subjectId);
        return {
          ...t,
          subjectCode: sub ? sub.code : 'GEN',
          subjectColor: sub ? sub.color : '#6366f1'
        };
      });

    // 7. Dynamic AI Productivity Advice
    let aiCoachInsight = 'Great consistency! Your study streak is actively reinforcing long-term memory.';
    if (todayMinutes >= targetMinutes) {
      aiCoachInsight = `🎉 Outstanding dedication! You hit your daily goal of ${targetMinutes} mins. Remember to take restful breaks to allow synaptic consolidation.`;
    } else if (urgentTasks.length > 0) {
      aiCoachInsight = `⚠️ You have ${urgentTasks.length} urgent academic task(s) approaching. We recommend a 50-minute deep work block on "${urgentTasks[0].title}".`;
    } else if (todayMinutes === 0) {
      aiCoachInsight = `🚀 Start your first 25-minute Pomodoro session today. The hardest part is starting; momentum takes care of the rest!`;
    }

    res.json({
      success: true,
      stats: {
        todayMinutes,
        todayGoalProgress,
        dailyTargetMinutes: targetMinutes,
        weekMinutes,
        allTimeMinutes,
        totalTasks,
        completedTasksCount: completedTasks.length,
        pendingTasksCount: pendingTasks.length,
        inProgressTasksCount: inProgressTasks.length,
        urgentTasksCount: urgentTasks.length,
        completionRate,
        streakDays: streak,
        last7Days,
        subjectBreakdown,
        upcomingTasks,
        aiCoachInsight
      }
    });
  } catch (error) {
    next(error);
  }
};
