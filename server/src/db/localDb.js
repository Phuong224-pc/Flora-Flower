const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '../../data');

class LocalDb {
    constructor(collectionName) {
        this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
        this._init();
    }

    _init() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify([]));
        }
    }

    _read() {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(data);
    }

    _write(data) {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }

    async find(query = {}) {
        let data = this._read();
        // Basic filtering
        for (let key in query) {
            data = data.filter(item => item[key] === query[key]);
        }
        return data;
    }

    async findById(id) {
        const data = this._read();
        return data.find(item => item.id === id) || null;
    }

    async create(doc) {
        const data = this._read();
        const newDoc = { id: uuidv4(), ...doc, createdAt: new Date().toISOString() };
        data.push(newDoc);
        this._write(data);
        return newDoc;
    }

    async updateById(id, updateData) {
        const data = this._read();
        const index = data.findIndex(item => item.id === id);
        if (index === -1) return null;
        
        data[index] = { ...data[index], ...updateData, updatedAt: new Date().toISOString() };
        this._write(data);
        return data[index];
    }

    async deleteById(id) {
        let data = this._read();
        const index = data.findIndex(item => item.id === id);
        if (index === -1) return false;
        
        data = data.filter(item => item.id !== id);
        this._write(data);
        return true;
    }
}

module.exports = LocalDb;
