require("dotenv").config();
const { URL } = require("url");
const fetch = require("node-fetch");
const { query } = require("./utils/hasura");

exports.handler = async () => {
  const { movies } = await query({
    query: `
      query {
        movies {
          id
          title
          tagline
          poster
        }
      }
    `,
  });
  const api = new URL("https://www.omdbapi.com/");
  // add the secret api
  api.searchParams.set("apikey", process.env.OMDB_API_KEY);

  const promises = movies.map((movie) => {
    //   // use the movies omdbapi for look up
    api.searchParams.set("i", movie.id);
    return fetch(api)
      .then((response) => response.json())
      .then((data) => {
        const scores = data.Ratings;

        return {
          ...movie,
          scores,
        };
      });
  });

  const moviesWithRatings = await Promise.all(promises);

  return {
    statusCode: 200,
    body: JSON.stringify(moviesWithRatings),
  };
};
