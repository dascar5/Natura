class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    //hard copy query-ja, sa ... se to pretvara u zaseban objekat
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);
    //micemo ta polja iz urla da bi se sa json key-ovima samo radilo u DB
    //tipa, da nam ?page=2 ne kopa po bazi, nego da drugu stranicu sajta

    //1b) ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
    //let query = Tour.find(JSON.parse(queryStr));
    //{difficulty: 'easy', duration:{$gte:5}}
    //{ duration: { gte: '5' }, difficulty: 'easy' }
    //gte,gt,lte,lt replace sa $ verzijom da bi radilo
    //radi se odvojeni await zbog kasnije
    //pagination, etc, no data available if instant await
  }
  sort() {
    if (this.queryString.sort) {
      //url argumenti se odvajaju zarezima
      //split po zarezu i join sa space
      const sortBy = this.queryString.sort.split(',').join(' ');
      console.log(sortBy);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
      //default, ako ne dodamo sort, on ce ga po datumu kreacije sortirat
    }
    //sad ocemo sort i po ratingsAverage
    //ukoliko imamo jednaki price, onda po tome redja
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
      //postoji neka v varijabla u json, ovo je samo mice za potvrdu rada
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1; //page request or page 1 as default
    const limit = this.queryString.limit * 1 || 100; //result limit (1 result or 100 as default)
    const skip = (page - 1) * limit; //da se zna koliko ce se skipovat
    //page=2&limit=10, 1-10, page 1, 11-20, page 2 (skip first 10 results for page 2)
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
