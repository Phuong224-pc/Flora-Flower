/**
 * MongoDb wrapper — cung cấp cùng interface với LocalDb
 * Để controllers không cần biết đang dùng mode nào
 */
class MongoDb {
  constructor(Model) {
    this.Model = Model;
  }

  // Chuyển _id -> id cho nhất quán với LocalDb
  _format(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    obj.id = obj._id?.toString();
    return obj;
  }

  async find(query = {}) {
    const docs = await this.Model.find(query).lean();
    return docs.map(doc => ({ ...doc, id: doc._id?.toString() }));
  }

  async findById(id) {
    try {
      const doc = await this.Model.findById(id).lean();
      if (!doc) return null;
      return { ...doc, id: doc._id?.toString() };
    } catch {
      return null;
    }
  }

  async create(data) {
    const doc = await this.Model.create(data);
    return this._format(doc);
  }

  async updateById(id, updateData) {
    try {
      const doc = await this.Model.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: false }
      ).lean();
      if (!doc) return null;
      return { ...doc, id: doc._id?.toString() };
    } catch {
      return null;
    }
  }

  async deleteById(id) {
    try {
      const result = await this.Model.findByIdAndDelete(id);
      return !!result;
    } catch {
      return false;
    }
  }
}

module.exports = MongoDb;
