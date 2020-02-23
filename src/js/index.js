// Global app controller
// import string from './models/Search';
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/list';
import Likes from './models/Likes';
import {
    elements,
    renderLoader,
    clearLoader
} from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */


// Callback function for Search Controller
const state = {};
const controlSearch = async () => {
    // step 1- Get query from the view
    const query = searchView.getInput();

    try {
        if (query) {
            state.search = new Search(query); // step 2-  new Search object and add it to state

            // step 3- Prepare UI for the results e.g. = clearing prev results or showing the loading spinner
            searchView.clearInput();
            searchView.clearResults();
            renderLoader(elements.searchRes);
            // step 4- Search for the recipes
            await state.search.getResults();

            // step 5- Render results on UI 
            clearLoader(); //clear loader
            searchView.renderResults(state.search.result);

        }
    } catch (error) {
        alert('Something wrong with the search...');
        clearLoader();
    }

};

// Search Controller
elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
})


// Event Allegation Used Here -------------
// We use eventListener to the element that is already there 
// and then we try to figure out where the click happened

// ************   For Buttons -- Event Allegation  ***********

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goTopage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goTopage);
        //   console.log(goTopage);
    }

});




/// ************* RECIPE CONTROLLER *****************///

const controlRecipe = async () => {
    //get the id from url
    const id = window.location.hash.replace('#', '');
    console.log(id);
    if (id) {
        //prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // highlight selected search item
        if (state.search) searchView.highlightSelected(id);

        //create new recipe object
        state.recipe = new Recipe(id);
        try {
            //get recipe data  and parse the ingredient
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calculate time and servings
            state.recipe.calcTime();
            state.recipe.calcServings();
            //render results
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (error) {
            console.log(error);
            alert('Error Processing Recipe');
        }

    }
}


// window.addEventListener('hashchange',controlRecipe);
// window.addEventListener('load',controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


//*************** LIST CONTROLLER *****************//

const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});


//Handeling recipe button clicks
elements.recipe.addEventListener('click', e => {
            if (e.target.matches('.btn-decrease, .btn-decrease *')) {
                // Decrease button is clicked
                if (state.recipe.servings > 1) {
                    state.recipe.updateServings('dec');
                    recipeView.updateServingsIngredients(state.recipe);
                } 
            }
            else if(e.target.matches('.btn-increase, .btn-increase *')) {
                    // Increase button is clicked
                    state.recipe.updateServings('inc');
                    recipeView.updateServingsIngredients(state.recipe);
            }
            else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
                        // Add ingredients to shopping list
                        controlList();
            }
            else if (e.target.matches('.recipe__love, .recipe__love *')) {
                        // Like controller
                        controlLike();
                    }
            
    });



/** 
 * LIKE CONTROLLER
 */
const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

