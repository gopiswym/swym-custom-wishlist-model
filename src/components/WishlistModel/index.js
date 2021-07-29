import React, { useState, useEffect } from "react";
import {Form, Modal, Button, Card } from "react-bootstrap";
import "./style.css";
import * as _ from "lodash";
import { useDispatch } from 'react-redux';
import { fetchWishlistCateogory } from "../../app/reducer/wishlist-reducer"

const Counter = (props) => {
    let { count, setCount } = props;
    const [quantity, setQuantity] = useState(0);
    
    useEffect(()=>{
        setQuantity(count?count:0);
    },[count]);

    return (
        <div className="row">
            <div className="col-6">
                <div>Quantity</div>
                <div>{quantity}</div>
            </div>
            <div className="col-6">
                <div>
                    <Button className="m-1" onClick={()=>{
                        setQuantity(quantity+1);
                        setCount(quantity+1);
                    }}>+</Button>
                </div>
                <div>
                    <Button className="m-1" onClick={()=>{
                        if(quantity>0){
                            setQuantity(quantity-1);
                            setCount(quantity-1);
                        }
                    }}>-</Button>
                </div>
            </div>
        </div>
    )
}

const TotalDetails = (props) => {
    let { selectedList } = props;
    
    const [totalQuantity, setTotalQuantity] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(()=>{
        console.log('on calculate total quantity');
        let totalQuantity = 0;
        let price = 0;
        selectedList.map(item=>{
            totalQuantity += item.qty?item.qty:0;
            price += (item.pr*(item.qty?item.qty:0));
        });
        setTotalQuantity(totalQuantity);
        setTotalPrice(price);
    })

    return (
        <div className="row">
            <div>Total Quantity {totalQuantity}</div>
            <div>Total Price {totalPrice}</div>
        </div>
    )
}

const WishlistModel = (props) => {
    
    let { open, hide, productList } = props;
    console.log('on open ', productList);
    const dispatch = useDispatch();
    const [ allProducts, setAllProducts ] = useState([]);
    const [ selected, setSelected ] = useState([]);
    const [showAddList, setShowAddList] = useState(false);
    const [newListName, setNewListName] = useState('');

    const createNewWishlist = ( ) => {
        window._swat.createList({lname: newListName}, ({lid})=>{
            // successfully created list
            console.log("New list created with listid", {lid, selected});
            setNewListName(null);
            dispatch(fetchWishlistCateogory());
            let newList = selected.map((item)=>{
                let { epi, empi, du, qty, note, cprops } = item;
                return { epi, empi, du, qty, note, cprops };
            })
            window._swat.addProductsToList(lid, newList, (newListItem)=>{
                // successfully added list item
                console.log('on new list added',newListItem);
                dispatch(fetchWishlistCateogory());
              }, (xhrObj) => {
                // something went wrong
                console.log('error add products list',xhrObj);
              });
          }, (xhrObject)=>{
            // something went wrong
            console.log('error = ',xhrObject);
          });
    }

    useEffect(()=>{
        setSelected(_.cloneDeep(productList));
        setAllProducts(_.cloneDeep(productList));
    },[productList.length])
    
    return (
        <Modal size="lg" show={open} onHide={hide}>
            <Modal.Header closeButton>
                <Modal.Title>Make a draft order</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex">
                    <Form.Check type="checkbox" label="" checked={(selected && selected.length == productList.length)} 
                        onChange={(checkedItem)=>{
                            console.log('on checked change', checkedItem.target.checked);
                            if(checkedItem.target.checked){
                                setSelected(productList);
                            }else{
                                setSelected([]);
                            }
                        }} 
                    className="m-2 p-2" />    
                    <span className="p-2 h5 my-auto">{selected.length} Products Selected</span>
                </div>

                <div>
                    { allProducts && allProducts.map((item, index)=>{
                        console.log('product list changed', allProducts);
                        let selectedList = [...selected];
                        let checkedIndex = selected && selected.findIndex(selectedItem=>selectedItem.id==item.id);
                        return (
                            <Card key={index} className="row m-2 p-3" style={{ textDecoration: 'none' }} >
                                <div className="row">
                                    <div  className="col-sm-12 col-md-3 col-lg-3 p-2 d-flex" >
                                        <Form.Check type="checkbox" label="" checked={(checkedIndex>-1)} onChange={(checkedItem)=>{
                                            console.log('on checked change', checkedItem.target.checked);                    if(checkedItem.target.checked){
                                                selectedList.push(item);
                                                setSelected(selectedList);
                                            }else{
                                                selectedList.splice(checkedIndex,1);
                                                setSelected(selectedList);
                                            }
                                        }} className="m-2 p-2" />
                                        <img alt="" height="100" src={item.iu} />
                                    </div>
                                    <div className="col-sm-12 col-md-6 col-lg-8 p-2">
                                        <div className="row">
                                            <div className="col-6">
                                                <h4>{item.dt}</h4>
                                                <h5>${item.pr}</h5>
                                            </div>
                                            <div className="col-6 row">
                                                <Counter count={item.qty} setCount={(count)=>{
                                                    item.qty = count;
                                                    selectedList[checkedIndex].qty = count;
                                                    setSelected([...selected]);
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
					    )
                    })}
                </div>
                <div>
                    <TotalDetails selectedList={selected} />
                </div>
                <Modal size="lg" show={showAddList} onHide={()=>setShowAddList(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create New List</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Wishlist new name</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={newListName}
                                onChange={(event)=>{
                                    setNewListName(event.target.value);
                                }}
                                placeholder="name" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" disabled={selected.length==0} onClick={()=>{
                            console.log('on Submit, Selected Products',selected);
                            setShowAddList(false);
                            hide();
                            createNewWishlist();
                        }}>
                            Create List
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>
                    Close
                </Button>
                <Button variant="primary" disabled={selected.length==0} onClick={()=>{
                    console.log('on Submit, Selected Products',selected);
                }}>
                    Creat Cart
                </Button>
                <Button 
                    variant="primary" 
                    disabled={selected.length==0} 
                    onClick={()=>{
                        console.log('on Submit, Selected Products',selected);
                        setShowAddList(true);
                    }}
                >
                    Dublicate List
                </Button>
            </Modal.Footer>
        </Modal>
    )
};

export default WishlistModel;