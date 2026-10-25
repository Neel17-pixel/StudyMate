import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class JsonCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf8');
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (err) {
      console.error(`Error reading ${this.name}.json:`, err.message);
      return [];
    }
  }

  _write(items) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error writing to ${this.name}.json:`, err.message);
    }
  }

  async find(query = {}) {
    let items = this._read();
    if (Object.keys(query).length === 0) return items;

    return items.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (key === '_id' || key === 'id') {
          if (String(item._id) !== String(val) && String(item.id) !== String(val)) return false;
        } else if (val && typeof val === 'object' && val.$in) {
          const stringIn = val.$in.map(v => String(v));
          if (!stringIn.includes(String(item[key]))) return false;
        } else if (val && typeof val === 'object' && (val.$gte || val.$lte)) {
          const itemVal = new Date(item[key]).getTime();
          if (val.$gte && itemVal < new Date(val.$gte).getTime()) return false;
          if (val.$lte && itemVal > new Date(val.$lte).getTime()) return false;
        } else if (String(item[key]) !== String(val)) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(query = {}) {
    const results = await this.find(query);
    return results[0] || null;
  }

  async findById(id) {
    const items = this._read();
    return items.find(i => i._id === id || i.id === id) || null;
  }

  async create(data) {
    const items = this._read();
    const now = new Date().toISOString();
    const assignedId = data._id || data.id || uuidv4();
    const newItem = {
      _id: assignedId,
      id: assignedId,
      ...data,
      createdAt: data.createdAt || now,
      updatedAt: now
    };
    items.unshift(newItem);
    this._write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    const items = this._read();
    const index = items.findIndex(i => i._id === id || i.id === id);
    if (index === -1) return null;

    const updated = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    items[index] = updated;
    this._write(items);
    return updated;
  }

  async findByIdAndDelete(id) {
    let items = this._read();
    const item = items.find(i => i._id === id || i.id === id);
    if (!item) return null;

    items = items.filter(i => i._id !== id && i.id !== id);
    this._write(items);
    return item;
  }

  async deleteMany(query = {}) {
    let items = this._read();
    const initialCount = items.length;

    items = items.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (String(item[key]) === String(val)) return false;
      }
      return true;
    });

    this._write(items);
    return { deletedCount: initialCount - items.length };
  }

  async countDocuments(query = {}) {
    const results = await this.find(query);
    return results.length;
  }
}

export const collections = {
  users: new JsonCollection('users'),
  subjects: new JsonCollection('subjects'),
  tasks: new JsonCollection('tasks'),
  sessions: new JsonCollection('sessions'),
  notes: new JsonCollection('notes'),
  chatMessages: new JsonCollection('chat_messages')
};
