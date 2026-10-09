import { getTrendingMovies, updateSearchCount } from "./appwrite";
import Loader from "./components/Loader";
import MovieCard from "./components/MovieCard";
import Search from "./components/Search";
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm],
  );

  const fetchMovie = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`Failed to Fetch Movies`);
      }
      const data = await response.json();
      
      if (!data.results || data.results.length === 0){
        setMovieList([]);
        if(query){
          setErrorMessage("NO movies found matching your search.");
        }
        return;
      }
      
      setMovieList(data.results);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
        await loadingTrendingMovies();
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(`Fail to fetch movie: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadingTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies || []);
    } catch (error) {
      console.log(`Error Fetching Moving ${error}`);
    }
  };

  useEffect(() => {
    fetchMovie(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadingTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="banner" />
          <h1>
            Find <span className="text-gradient">Movie</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {trendingMovies && trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.searchTerm || movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="all-movies">
          <h2 className="">All Movies</h2>
          {errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : isLoading ? (
            <Loader />
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
