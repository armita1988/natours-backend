class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryStr = { ...queryString };
  }

  filter() {
    let filterObj = { ...this.queryStr };
    const excludedFields = [
      'fields',
      'sort',
      'page',
      'limit',
      'search',
      'destination',
    ];
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
    const limit = this.queryStr.limit * 1 || 20;
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

  search() {
    if (this.queryStr.search) {
      this.query = this.query.find({
        $or: [
          { name: { $regex: this.queryStr.search, $options: 'i' } },
          { summary: { $regex: this.queryStr.search, $options: 'i' } },
          { description: { $regex: this.queryStr.search, $options: 'i' } },
          {
            'startLocation.description': {
              $regex: this.queryStr.search,
              $options: 'i',
            },
          },
          { difficulty: { $regex: this.queryStr.search, $options: 'i' } },
        ],
      });
    }
    if (this.queryStr.destination) {
      this.query = this.query.find({
        'startLocation.description': {
          $regex: this.queryStr.destination,
          $options: 'i',
        },
      });
    }
    return this;
  }
}

module.exports = ApiFeatures;
