
const app = require('express')()
const bodyParser = require('body-parser')
const _ = require('lodash');
const axios = require('axios')



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// middle ware for fetching data from api
const fetchBlogData = async (req, res, next) => {

  try {


    // secret can be made hidden using process.env file
    const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
      headers: {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
      }
    });

    req.blogDatas = response.data;
    next();

  } catch (err) {

    res.status(500).json({ error: 'Error fetching blog data ' });

  }
}

// middle ware to get insights from response

const analyzeBlogData = (req, res, next) => {

  const { blogDatas } = req;

  console.log(blogDatas)
  const blogData = blogDatas.blogs

  const totalBlogs = blogData.length;

  console.log(totalBlogs)


  const longestBlog = _.maxBy(blogData, (blog) => blog.title.length);
  console.log(longestBlog)

  const privacyBlogs = _.filter(blogData, (blog) => {

    return _.includes(_.toLower(blog.title), 'privacy');



  })





  const uniqueTitles = _.uniqBy(_.map(blogData, 'title'));




  req.blogStats = {
    totalBlogs: totalBlogs ? totalBlogs : null,
    longestBlogTitle: longestBlog ? longestBlog.title : null,
    privacyBlogs: privacyBlogs ? privacyBlogs.length : null,
    uniqueTitles: uniqueTitles ? uniqueTitles : null,
  };

  next();

}



// api routes 

app.get("/api/blog-stats", fetchBlogData, analyzeBlogData, (req, res) => {

  const { blogStats } = req;

  res.json(blogStats)


})



app.get('/api/blog-search', fetchBlogData, (req, res) => {
  
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ error: 'Query parameter "query" is required' });
    return;
  }

  const { blogDatas } = req;

  if (!blogDatas || !blogDatas.blogs) {
    res.status(500).json({ error: 'Error fetching blog data' });
    return;
  }

  let searchResults = _.filter(blogDatas.blogs, (blog) => {
    return _.includes(_.toLower(blog.title), _.toLower(query));
  });

  searchResults = searchResults.length != 0 ? searchResults : "No such title which include your query"
  res.json(searchResults);
});





app.listen('3000', () => {
  console.log("server is running")
})


