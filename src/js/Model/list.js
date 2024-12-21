
import uniqid from 'uniqid';

export default class List{
    constructor(){
        this .items = [];
    }


    deleteItem(id){
        const index = this.items.findIndex(el => el.id ===id);

        this.items.splice(index, 1);
        }


    addItem(item){
        let newItem = {
            id: uniqid(),
            item
        };

        this.items.push(newItem);

        return newItem;
}
     }
     