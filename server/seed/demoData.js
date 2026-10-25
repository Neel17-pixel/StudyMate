import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User.js';
import { SubjectModel } from '../models/Subject.js';
import { TaskModel } from '../models/Task.js';
import { StudySessionModel } from '../models/StudySession.js';
import { NoteModel } from '../models/Note.js';
import { ChatMessageModel } from '../models/ChatMessage.js';

export const seedDemoUserData = async (userId) => {
  // Check if user already has subjects
  const existingSubjects = await SubjectModel.find({ userId });
  if (existingSubjects && existingSubjects.length > 0) {
    return; // Already seeded
  }

  // 1. Create Subjects
  const subjects = [
    {
      userId,
      name: 'Data Structures & Algorithms',
      code: 'CS201',
      color: '#6366f1', // Indigo
      instructor: 'Dr. Sarah Mitchell',
      credits: 4,
      targetGrade: 'A',
      schedule: 'Mon, Wed 10:00 AM - 11:30 AM'
    },
    {
      userId,
      name: 'Linear Algebra & Applications',
      code: 'MATH204',
      color: '#06b6d4', // Cyan
      instructor: 'Prof. David Vance',
      credits: 3,
      targetGrade: 'A-',
      schedule: 'Tue, Thu 02:00 PM - 03:30 PM'
    },
    {
      userId,
      name: 'Computer Systems & Architecture',
      code: 'CS220',
      color: '#ec4899', // Pink
      instructor: 'Dr. Elena Rostova',
      credits: 4,
      targetGrade: 'A',
      schedule: 'Mon, Fri 01:00 PM - 02:30 PM'
    },
    {
      userId,
      name: 'Cognitive Psychology & Memory',
      code: 'PSYC101',
      color: '#10b981', // Emerald
      instructor: 'Dr. Robert Thorne',
      credits: 3,
      targetGrade: 'A',
      schedule: 'Wed 03:00 PM - 05:00 PM'
    }
  ];

  const createdSubjects = [];
  for (const sub of subjects) {
    const s = await SubjectModel.create(sub);
    createdSubjects.push(s);
  }

  const cs201 = createdSubjects[0];
  const math204 = createdSubjects[1];
  const cs220 = createdSubjects[2];
  const psyc101 = createdSubjects[3];

  // 2. Create Realistic Academic Tasks
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  const tasks = [
    {
      userId,
      subjectId: cs201._id || cs201.id,
      title: 'Implement Red-Black Tree Balancing & Deletion',
      description: 'Complete the rotateLeft, rotateRight, and color flipping methods. Verify with unit test suite.',
      type: 'Assignment',
      priority: 'urgent',
      status: 'in_progress',
      dueDate: new Date(now.getTime() + 1.5 * day),
      estimatedMinutes: 120,
      actualMinutes: 45,
      tags: ['trees', 'algorithms', 'c++'],
      isPinned: true
    },
    {
      userId,
      subjectId: math204._id || math204.id,
      title: 'Eigenvalues & Diagonalization Problem Set 4',
      description: 'Solve questions 4.1 to 4.15 regarding characteristic polynomials and geometric multiplicity.',
      type: 'Assignment',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(now.getTime() + 3 * day),
      estimatedMinutes: 90,
      actualMinutes: 0,
      tags: ['matrices', 'eigenvalues', 'homework'],
      isPinned: true
    },
    {
      userId,
      subjectId: cs220._id || cs220.id,
      title: 'Midterm Exam Preparation & Cache Simulator',
      description: 'Review direct-mapped vs set-associative cache architectures and write the L1 hit/miss parser.',
      type: 'Exam Prep',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(now.getTime() + 4 * day),
      estimatedMinutes: 180,
      actualMinutes: 60,
      tags: ['midterm', 'cache', 'architecture'],
      isPinned: false
    },
    {
      userId,
      subjectId: psyc101._id || psyc101.id,
      title: 'Research Paper: Working Memory Capacity in Multitasking',
      description: 'Write a 1500-word critique analyzing Miller’s 7±2 law and modern Cowan 4-chunk limitations.',
      type: 'Project',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(now.getTime() + 7 * day),
      estimatedMinutes: 240,
      actualMinutes: 30,
      tags: ['paper', 'psychology', 'literature-review'],
      isPinned: false
    },
    {
      userId,
      subjectId: cs201._id || cs201.id,
      title: 'Graph Traversal (BFS / DFS / Dijkstra) Lab 3',
      description: 'Implemented shortest path algorithm for weighted graphs with adjacency lists.',
      type: 'Lab Report',
      priority: 'medium',
      status: 'completed',
      dueDate: new Date(now.getTime() - 2 * day),
      estimatedMinutes: 90,
      actualMinutes: 85,
      completedAt: new Date(now.getTime() - 1.5 * day),
      tags: ['graphs', 'dijkstra', 'lab'],
      isPinned: false
    },
    {
      userId,
      subjectId: math204._id || math204.id,
      title: 'Gram-Schmidt Orthonormalization Quiz',
      description: 'Self-study quiz on vector projections and QR decomposition.',
      type: 'Quiz',
      priority: 'low',
      status: 'completed',
      dueDate: new Date(now.getTime() - 1 * day),
      estimatedMinutes: 45,
      actualMinutes: 40,
      completedAt: new Date(now.getTime() - 0.8 * day),
      tags: ['orthogonal', 'vectors'],
      isPinned: false
    }
  ];

  for (const t of tasks) {
    await TaskModel.create(t);
  }

  // 3. Create Study Sessions (Focus Logs) over recent days
  const sessions = [
    {
      userId,
      subjectId: cs201._id || cs201.id,
      durationMinutes: 50,
      sessionType: 'deep_work',
      productivityRating: 5,
      notes: 'Cracked the red-black tree rotation logic. Extremely focused session!',
      completedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000)
    },
    {
      userId,
      subjectId: cs201._id || cs201.id,
      durationMinutes: 25,
      sessionType: 'pomodoro',
      productivityRating: 4,
      notes: 'Unit tested tree edge cases with null sentinel nodes.',
      completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
    },
    {
      userId,
      subjectId: math204._id || math204.id,
      durationMinutes: 50,
      sessionType: 'pomodoro',
      productivityRating: 5,
      notes: 'Derived characteristic equations for 3x3 matrices.',
      completedAt: new Date(now.getTime() - 1 * day)
    },
    {
      userId,
      subjectId: cs220._id || cs220.id,
      durationMinutes: 45,
      sessionType: 'pomodoro',
      productivityRating: 4,
      notes: 'Simulated 2-way set associative cache replacement policy.',
      completedAt: new Date(now.getTime() - 2 * day)
    },
    {
      userId,
      subjectId: psyc101._id || psyc101.id,
      durationMinutes: 30,
      sessionType: 'pomodoro',
      productivityRating: 4,
      notes: 'Reviewed Baddeley’s model of working memory.',
      completedAt: new Date(now.getTime() - 3 * day)
    }
  ];

  for (const s of sessions) {
    await StudySessionModel.create(s);
  }

  // 4. Create Notes with AI summaries
  const notes = [
    {
      userId,
      subjectId: cs201._id || cs201.id,
      title: 'Balanced Binary Search Trees & AVL Invariants',
      content: `# Balanced Search Trees: AVL vs Red-Black

## Key AVL Invariant
- For every node, balance factor $BF = |h_{left} - h_{right}| \\le 1$.
- Strict balancing means lookups are slightly faster than Red-Black trees ($1.44 \\log n$).

## Red-Black Properties
1. Every node is either Red or Black.
2. The root is always Black.
3. No two red nodes can be adjacent (Red node children are Black).
4. Every path from a node to descendant null nodes contains the same number of Black nodes.

## When to use which?
- AVL: Lookup-heavy databases where read speed is paramount.
- Red-Black: Insert/Delete-heavy systems (e.g., C++ \`std::map\`, Java \`TreeMap\`).`,
      tags: ['trees', 'algorithms', 'exam-notes'],
      isPinned: true,
      aiSummary: 'AVL trees enforce strict height balance for faster reads, whereas Red-Black trees require fewer rotations during frequent insertions and deletions.'
    },
    {
      userId,
      subjectId: math204._id || math204.id,
      title: 'Eigenvalues, Determinants & Trace Properties',
      content: `# Fundamental Eigenvalue Theorems

1. **Sum of Eigenvalues**: Equal to the trace of matrix $A$:
   $$\\sum_{i=1}^n \\lambda_i = \\text{tr}(A)$$

2. **Product of Eigenvalues**: Equal to the determinant:
   $$\\prod_{i=1}^n \\lambda_i = \\det(A)$$

3. **Diagonalizability**: $A$ is diagonalizable if and only if it possesses $n$ linearly independent eigenvectors.`,
      tags: ['linear-algebra', 'formulas'],
      isPinned: false,
      aiSummary: 'The trace of a matrix equals the sum of its eigenvalues, and the determinant equals their product. A matrix is diagonalizable iff it has n linearly independent eigenvectors.'
    }
  ];

  for (const n of notes) {
    await NoteModel.create(n);
  }

  // 5. Initial AI Chat messages
  const chatMessages = [
    {
      userId,
      role: 'assistant',
      content: `👋 Hello Alex! Welcome to your StudyMate AI workspace.

I'm your 24/7 academic tutor powered by Google Gemini. Here's what we can accomplish together:
- 💡 **Explain Difficult Concepts**: Ask me about any topic using analogies and intuitive breakdowns.
- 📝 **Generate Exam Quizzes**: Try self-testing on Data Structures, Linear Algebra, or Psychology.
- 📑 **Summarize Notes**: Paste lecture text and I'll build a bulletproof cheat sheet.
- 💻 **Debug Algorithms**: Step through data structures and Big O space/time trade-offs.

What subject are we mastering today?`,
      mode: 'general',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000)
    }
  ];

  for (const m of chatMessages) {
    await ChatMessageModel.create(m);
  }

  console.log(`✨ Successfully seeded rich demo data for student ${userId}`);
};

export const ensureDemoUser = async () => {
  const demoEmail = 'alex.student@studymate.edu';
  let demoUser = await UserModel.findOne({ email: demoEmail });

  if (!demoUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('studymate123', salt);

    demoUser = await UserModel.create({
      name: 'Alex Chen',
      email: demoEmail,
      password: hashedPassword,
      major: 'Computer Science & Mathematics',
      university: 'Pacific University of Technology',
      dailyStudyTargetMinutes: 180,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      theme: 'dark'
    });
    console.log('Created default Demo User: alex.student@studymate.edu / studymate123');
  }

  await seedDemoUserData(demoUser._id || demoUser.id);
  return demoUser;
};
