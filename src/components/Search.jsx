const Search = ({searchTerm, setSearchTerm}) => {
  return (
    <div className="search">
      <div>
        <img src="./search.svg" />
        <input placeholder="Search through thousands of movies"
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
         /> 
      </div>
    </div>
  );
};

export default Search;
