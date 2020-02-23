import {elements} from './base';

export const getInput = () => elements.searchInput.value; // one line therefore imlicit return hence no need of writing the return keyword.
export const clearInput = () =>{
     elements.searchInput.value = '';
};

// for clearing search results 
export const clearResults = () =>
{
     elements.searchResList.innerHTML = '';
     elements.searchResPages.innerHTML = '';
};

// for highlight selector
export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll('.results__link'));
    resultsArr.forEach(el => {
        el.classList.remove('results__link--active');
    });
    document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
};


export const limitRecipeTitle = (title,limit=17) =>{
    const newTitle = [];  
    if(title.length > limit)
      {
         // split the title in words and use reduce method on the array
         // which allows us to have an accumulator and accumulator is like the 
         // variable that we can add in each iteration of the loop and then we 
         //are gonna check if the current title.length + next  word is still under th limit
         
         title.split(' ').reduce((acc,cur) => {
            if(acc+cur.length <= limit)
            {
               newTitle.push(cur);
            }
            return acc + cur.length; //updating the accumulator
         },0);
             // return the result
            return `${newTitle.join(' ')}...` ;
      }
      return title;
}


const renderRecipe = recipe =>
{
    // recieves just one recipe
        const markup = `
        <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="Test">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
        </li>
        `;
    elements.searchResList.insertAdjacentHTML('beforeend',markup);
   
};
// type -- 'prev' OR 'next'
const createButton = (page,type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
    <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>    
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
        </svg>
        
    </button>
`;

const renderButtons = (page,numResults,resPerPage) =>
{
   const pages = Math.ceil(numResults/resPerPage);
   let button;
   if(page === 1 && pages>1)
   {
      // only button to go to next page
      button  = createButton(page,'next');
      
   }
   else if(page < pages)
   {
       // both buttons
       button  = `
        ${createButton(page,'next')}
        ${createButton(page,'prev')}
        `;
   }
   if(page === pages && pages>1)
   {
       // only button to go to prev page
       button  = createButton(page,'prev');
   }
    elements.searchResPages.insertAdjacentHTML('afterbegin',button);
};
export const renderResults = (recipes,page = 1,resPerPage = 10) => {
    // recieves an array of recipes and loop thorugh each item and renders it;
    
    // render results of current page
    const start = (page-1)*resPerPage;
    const end = page*resPerPage;
    recipes.slice(start,end).forEach(renderRecipe);

    // render pagination buttons
     renderButtons(page,recipes.length,resPerPage);

};