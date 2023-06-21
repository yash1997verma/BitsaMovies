
const SearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultBox = document.getElementById('result-box');
const movieSearch = document.querySelector('.form-control');
const myWatchListButton = document.querySelector('.watchlistButton button')
const closeWatchList = document.querySelector('.top-section-watchlist i');
const watchMoviesList = document.getElementById('watchMoviesList');
const watchlistContainer = document.getElementById('watchlistContainer');



// **********************Main Page**********************
//for search box
movieSearch.addEventListener('click', findMovies );
movieSearch.addEventListener('keyup', findMovies );

//for hiding search list
window.addEventListener('click', (event) => {
    if(event.target.className != "form-control"){
        searchList.classList.add('hide-search-list');
    }
   
});

//for moview page addToWatchlist
resultBox.addEventListener('click', function(event) {
    const movieAddButton = event.target.closest('.moviePage-add');
    const id = event.target.dataset.id;
    // console.log(id);
    
    if (movieAddButton){
        addToMyWatchList(id);
        renderWatchList();
        return;
    }
});

// for adding and removing hide-search-list class
function findMovies(event){
    let searchTerm = (event.target.value);
    if(searchTerm.length > 0){
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    }else {
        searchList.classList.add('hide-search-list');
    }
}

// fetching data from OMDB API
async function loadMovies(searchTerm){
    try{
        //this will not return one movie but insted a array of all the movie titles which matched entered string
        const URL = `https://www.omdbapi.com/?s=${searchTerm}&page=1&apikey=e1adb676`;
       
        const res = await fetch(`${URL}`);
        const data = await res.json();

        if(data.Response == "True") {
            displayMovieList(data.Search);//this will send a list to fn
        }
    }catch(error){
        console.log(`Error in fetching OMDB API ${error}`);
    }
    
    
}

// for displaying search results and updating dynamically using OMDB API
function displayMovieList(movies){
    
    searchList.innerHTML = "";
    for(let idx = 0; idx < movies.length; idx++){
        let movieListItem = document.createElement('div');
        movieListItem.dataset.id = movies[idx].imdbID; 
        movieListItem.classList.add('search-list-item');
        if(movies[idx].Poster != "N/A"){
            moviePoster = movies[idx].Poster;
        }else {
            moviePoster = '/images/no-poster-available.jpg';
        }
           

        movieListItem.innerHTML = `
        
        <div class = "search-item-thumbnail">
            <img src = "${moviePoster}">
        </div>
        <div class = "search-item-info">
            <h3>${movies[idx].Title}</h3>
            <p>${movies[idx].Year}</p>
        </div>
        <div class="add">
            <i class="fa-regular fa-square-plus" title="Add to WatchList" data-id =${movies[idx].imdbID} data></i>
        </div>
        `;
        //appending newly created movieListItem in the searchList div
        searchList.appendChild(movieListItem);
    }
    loadMovieDetails();
}



//for loading movie page when a movie is clicked
function loadMovieDetails(){
   
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    // console.log(searchListMovies);
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async (event) => {

            //for adding to watchlist
            if (event.target.matches('.add i')) {
                const id = event.target.dataset.id;
                addToMyWatchList(id);
                renderWatchList();
                return;
            }
            SearchBox.value = "";
            const result = await fetch(`https://www.omdbapi.com/?i=${movie.dataset.id}&apikey=e1adb676`);
            const movieDetails = await result.json();
            displayMovieDetails(movieDetails);
        });
    });
}


//display fetched movie details
function displayMovieDetails(details){
    // console.log(details)
    resultBox.innerHTML = `
    <div class = "movie-poster col-sm-12 col-md-4">
        <img class ='img-fluid' src = "${(details.Poster != "N/A") ? details.Poster : "/images/no-poster-available.jpg"}" alt = "movie poster">
    </div>
    <div class = "movie-info col-sm-12 col-md-8 d-flex flex-column justify-content-center">
        <h3 class = "movie-title">${details.Title}</h3>
        <ul class = "movie-misc-info">
            <li class = "year">Year: ${details.Year}</li>
            <li class = "rated">Rated: ${details.Rated}</li>
            <li class = "released">Released: ${details.Released}</li>
        </ul>
        <div class='moviePage-add' data-id=${details.imdbID}>
            <span data-id=${details.imdbID}>Add to WatchList</span><i class="fa-regular fa-square-plus" title="Add to WatchList" data-id=${details.imdbID}></i>
        </div>
        <p class = "genre"><b>Genre:</b> ${details.Genre}</p>
        <p class = "writer"><b>Writer:</b> ${details.Writer}</p>
        <p class = "actors"><b>Actors: </b>${details.Actors}</p>
        <p class = "plot"><b>Plot:</b> ${details.Plot}</p>
        <p class = "language"><b>Language:</b> ${details.Language}</p>
        <p class = "awards"><b><i class = "fas fa-award"></i></b> ${details.Awards}</p>
        
        </div>
    
    `;
}









// **********************************My Watch List***************************************


//we will save movie id in array, using which we can fetch API
let watchlist=[];

//for myWatchList Button
myWatchListButton.addEventListener('click', function() {
    renderWatchList();
    slideInWatchListContainer();
});
function slideInWatchListContainer() {
    const watchlistContainer = document.getElementById('watchlistContainer');
    watchlistContainer.classList.remove('slide-out');
    watchlistContainer.classList.add('slide-in');
}

//for closing watchList by clicking anywhere else than watchlist, i.e. on main screen
window.addEventListener('click', (event) => {
    const isWatchlistButton = event.target.closest('.watchlistButton');
    const isWatchlistContainer = event.target.closest('.watchlistContainer');

    if (!isWatchlistButton && !isWatchlistContainer) {
        console.log('hello');
        watchlistContainer.classList.remove('slide-in');
        watchlistContainer.classList.add('slide-out');
    }
});

//for closing watchList through close button
closeWatchList.addEventListener('click', function(){
    watchlistContainer.classList.remove('slide-in');
    watchlistContainer.classList.add('slide-out');
});

//for loading movie details and triggering remove item fn
watchMoviesList.addEventListener('click', async function(event) {
    
    const removeButton = event.target.closest('.remove');
    if (removeButton) {
        //when clicking on the remove button, the event will not propagate to the parent elements, avoiding to close the watchlist
        event.stopPropagation();
       
        const dataId = removeButton.getAttribute('data-id');
        removeFromWatchList(dataId);
        return;
    }
    
    const watchlistItem = event.target.closest('.watchlist-item');
    if (watchlistItem) {
      const dataId = watchlistItem.getAttribute('data-id');
      const result = await fetch(`https://www.omdbapi.com/?i=${dataId}&apikey=e1adb676`);
      const movieDetails = await result.json();
      displayMovieDetails(movieDetails);
    }
});

//add
function addToMyWatchList(id) {
    if (!watchlist.includes(id)) {
        watchlist.push(id);
        // console.log(watchlist);
    }
}

//remove
function removeFromWatchList(id){
    // console.log(id);
    watchlist = watchlist.filter(item => item !== id);
    renderWatchList();
}

//render watchlist
function renderWatchList(){

  
    watchMoviesList.innerHTML='';

    watchlist.forEach(async function(id){
        try{
            const result = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=e1adb676`);
            const movieDetails = await result.json();
            // console.log(movieDetails);
    
    
            // creating a new movie item
            let newMovie = document.createElement('div');
            newMovie.classList.add('watchlist-item');
            newMovie.setAttribute('data-id', `${movieDetails.imdbID}`);
          
            let posterResult = await fetch(`https://img.omdbapi.com/?i=${id}&apikey=e1adb676`);
            // console.log(posterResult)
            if(posterResult.ok === true){
                var moviePoster = posterResult.url;

            }else {
                var moviePoster = '/images/no-poster-available.jpg';
            }
            newMovie.innerHTML=`
            <div class = "watchlist-thumbnail">
                <img src = "${moviePoster}">
            </div>
            <div class = "watch-item-info">
                <span> ${movieDetails.Title}</span>
                <p>${movieDetails.Year}|${movieDetails.Runtime}|${movieDetails.Rated}|${movieDetails.Genre}</p>
                <p id = "rating"><i class="fa-solid fa-star" style="color: #f5c518;"></i> ${movieDetails.imdbRating} </p>
                

                
            </div>
            <div class="remove data-id="${movieDetails.imdbID}">
                <i data-id="${movieDetails.imdbID}" class="remove fa-solid fa-minus"></i>
            </div>
            `;
            
            // appending newly created watchListItem in the searchList div
            watchMoviesList.appendChild(newMovie);
    
        }catch(error){
            console.log(`Error ${error}`);
        }     
    });
}












  