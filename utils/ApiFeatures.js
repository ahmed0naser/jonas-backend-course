class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryCopy = { ...this.queryString };
    const excl = ["page", "limit", "sort", "fields"];
    excl.forEach((el) => delete queryCopy[el]);
    let q = JSON.stringify(queryCopy);
    q = q.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // queryCopy = JSON.parse(queryCopy);
    this.query = this.query.find(JSON.parse(q));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortby = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortby);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  limitfields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  page() {
    const limit = this.queryString.limit * 1 || 100;
    const page = this.queryString.page * 1 || 1;
    const skip = (page - 1) * limit;
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('no such page');
    // }
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
module.exports = ApiFeatures;
