
//fetch();
import Search from "./Model/Search";

let search = new Search("pizza");

search.doSearch().then(r => console.log(r));