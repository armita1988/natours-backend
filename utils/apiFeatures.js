class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryStr = { ...queryString };
  }

  filter() {
    let filterObj = { ...this.queryStr };
    const excludedFields = ['fields', 'sort', 'page', 'limit'];
    excludedFields.forEach((val) => {
      delete filterObj[val];
    });

    filterObj = JSON.stringify(filterObj);
    filterObj = filterObj.replace(
      /\b(gt|gte|lt|lte)\b/g,
      (match) => `$${match}`,
    );

    this.query = this.query.find(JSON.parse(filterObj));
    return this;
  }

  selectFields() {
    if (this.queryStr.fields) {
      const selectedFields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(selectedFields);
    }
    return this;
  }

  paginate() {
    const limit = this.queryStr.limit * 1 || 10;
    const page = this.queryStr.page * 1 || 1;
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      const sortFields = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortFields);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
}

module.exports = ApiFeatures;
