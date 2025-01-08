require("@babel/polyfill");
import Search from "./Model/Search";
import { elements, renderLoader, clearLoader } from "./View/base";
import * as searchView from "./View/searchView";
import Recipe from "./Model/Recipe";
import { 
  renderRecipe, 
  clearRecipe, 
  highlightSelectedRecipe 
} from "./View/recipeView";
import List from "./Model/list";
import Like from "./Model/Like";
import * as likesView from "./View/LikesView";
import * as listView from "./View/listView";





/**
 * Web app төлөв
 * - Хайлтын query, үр дүн
 * - Тухайн үзүүлж байгаа жор
 * - Лайкласан жорууд
 * - Захиалж байгаа жорын найрлаганууд
 */

const state = {};
likesView.toggleLikeMenu(0);

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
  if(!state.likes) state.likes = new Like();

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
   renderRecipe(state.recipe, state.likes.isLiked(id));
 }

};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));

// Найрлаганы controller

const controlList = () => {

  // console.log("like hiigdlee");
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

const controlLike = () => {
  // 1) Лайкийн моделийг үүсгэнэ.
  if (!state.likes) state.likes = new Like();

  // 2) Одоо харагдаж байгаа жорын ID-ийг олж авах
  const currentRecipeId = state.recipe.id;

  // 3) Энэ жорыг лайкласан эсэхийг шалгах
  if (state.likes.isLiked(currentRecipeId)) {
    // Лайкласан бол лайкийг нь болиулна
    state.likes.deleteLike(currentRecipeId);
    // Лайкын цэснээс устгана
    likesView.deleteLike(currentRecipeId);

    // Лайк товчны лайкласан байдлыг болиулах
    likesView.toggleLikeBtn(false);
  } else {
    // Лайклаагүй бол лайклана.
    const newLike = state.likes.addLike(
      currentRecipeId,
      state.recipe.title,
      state.recipe.publisher,
      state.recipe.image_url
    );

    // Лайк цэсэнд энэ лайкыг оруулах
    likesView.renderLike(newLike);

    // Лайк товчны лайкласан байдлыг лайкласан болгох
    likesView.toggleLikeBtn(true);
  }

  likesView.toggleLikeMenu(state.likes.getNumberOfLikes());
};

elements.recipeDiv.addEventListener('click', e => {
  if(e.target.matches(".recipe__btn, .recipe__btn * ")){
   controlList();
   
  }else if (e.target.matches('.recipe__love, .recipe__love *')){
    controlLike();
  }
});


elements.shoppingList.addEventListener('click', e => {
  //click хийсэн list бариж авах
  const id = e.target.closest('.shopping__item').dataset.itemid;


  state.list.deleteItem(id);

  listView.deleteItem(id);

});