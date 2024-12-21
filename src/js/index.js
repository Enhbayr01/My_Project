require("@babel/polyfill");
import Search from "./model/Search";
import { elements, renderLoader, clearLoader } from "./View/base";
import * as searchView from "./View/searchView";
import Recipe from "./model/Recipe";
import List from "./Model/list";
import { renderRecipe, clearRecipe, highlightSelectedRecipe } from "./View/recipeView";
import * as listView from "./View/listView";
/**
 * Web app төлөв
 * - Хайлтын query, үр дүн
 * - Тухайн үзүүлж байгаа жор
 * - Лайкласан жорууд
 * - Захиалж байгаа жорын найрлаганууд
 */

const state = {};

const controlSearch = async () => {
  // 1) Вэбээс хайлтын түлхүүр үгийг гаргаж авна.
  const query = searchView.getInput();

  if (query) {
    // 2) Шинээр хайлтын обьектийг үүсгэж өгнө.
    state.search = new Search(query);

    // 3) Хайлт хийхэд зориулж дэлгэцийг UI бэлтгэнэ.
    searchView.clearSearchQuery();
    searchView.clearSearchResult();
    renderLoader(elements.searchResultDiv);

    // 4) Хайлтыг гүйцэтгэнэ
    await state.search.doSearch();

    // 5) Хайлтын үр дүнг дэлгэцэнд үзүүлнэ.
    clearLoader();
    if (state.search.result === undefined) alert("Хайлтаар илэрцгүй...");
    else searchView.renderRecipes(state.search.result);
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.pageButtons.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");

  if (btn) {
    const gotoPageNumber = parseInt(btn.dataset.goto, 10);
    searchView.clearSearchResult();
    searchView.renderRecipes(state.search.result, gotoPageNumber);
  }
});

// Жорын controller

const controlRecipe = async () => {
  // URL-аас ID салгах
  const id = window.location.hash.replace("#", "");
 if(id){
   // Жорны моделийг үүсгэж өгнө.
   state.recipe = new Recipe(id);
   // UI дэлгэц бэлдэх
   clearRecipe();
   renderLoader(elements.recipeDiv);
   highlightSelectedRecipe(id);
   
   // Жороо татаж авчирна
   await state.recipe.getRecipe();
   // Жорыг гүйцэтгэх хугацаа болон орцыг тооцоолно
   clearLoader();
   state.recipe.calcTime();
   state.recipe.calcHuniiToo();
 
    // Жороо дэлгэцэнд гаргана 
   renderRecipe(state.recipe);
 }

};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));

// Найрлаганы controller

const controlList = () => {

  //Найрлаганы моделийг үүсгэнэ
  state.list = new List();
///өмнө харагдаж байсан item устгах

  listView.clearItem();

  //уг моделруу одоо харагдаж байгаа жорны бүх найрлагыг авч хйинэ 
  state.recipe.ingredients.forEach(n => { 
    const item = state.list.addItem(n);
    //туайн найрлагыг дэлгэцэнд гаргана

  listView.renderItem(item);

  });

};

elements.recipeDiv.addEventListener('click', e => {
  if(e.target.matches(".recipe__btn, .recipe__btn * ")){
   controlList();
   
  }
});


elements.shoppingList.addEventListener('click', e => {
  //click хийсэн list бариж авах
  const id = e.target.closest('.shopping__item').dataset.itemid;


  state.list.deleteItem(id);

  listView.deleteItem(id);

});