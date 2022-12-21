class CustomCart extends HTMLElement {
  constructor() {
    super();
    var drawerOpen = document.querySelectorAll('[data-drawer-trigger]');
    var drawerClose = document.querySelector('[data-drawer-close]');
    this.updateEvents();
    if (drawerOpen != null) {
      this.openDrawer(drawerOpen);
    }
    if (drawerClose != null) {
      this.closeDrawer(drawerClose);
    }
  }
  
  /**
  *  Cart Drawer Open
  */
  openDrawer(drawerOpen) {
    drawerOpen.forEach(element => {
      element.addEventListener("click", (event) => {
        document.querySelectorAll("[data-drawer-trigger]")[0].click();
        this.getCartData()
        document.querySelector('.drawer').classList.add("is-active", "is-visible");
      })
    });
  }
  
  /**
  *  Cart Drawer Close
  */
  closeDrawer(drawerClose) {
    drawerClose.addEventListener("click", (event) => {
      document.querySelector('.drawer').classList.remove("is-active", "is-visible");
    })
  }
  
  /**
  *  Cart Data Get
  */
  getCartData() {
    fetch(`/cart?view=getcart`)
    .then(response => response.text())
    .then((result) => {
      document.querySelector("cart-content").innerHTML = result;
      this.updateEvents()
    })
    .catch((error) => {
      console.log(error);
    })
  }
  updateEvents() {
    this.querySelectorAll('[data-qty-btn]').forEach(button => button.addEventListener('click', this.manageQuantity.bind(this)));
    this.querySelectorAll('[data-qty-input]').forEach(button => button.addEventListener('change', this.onQtyChange.bind(this)));
    this.querySelectorAll('[data-itemremove]').forEach(button => button.addEventListener('click', this.removeItem.bind(this)));
    this.querySelectorAll('[note-save]').forEach(button => button.addEventListener('click', this.cartNote.bind(this)));
    this.querySelectorAll('[textnote]').forEach(button => button.addEventListener('keyup', this.cartNoteText.bind(this)));
  }
  
  /**
  *  Cart Item Qunatity Increment/Decrement Button event
  */
  manageQuantity(event) {
    event.preventDefault();
    let currentTarget = event.currentTarget;
    let targetName = event.currentTarget.getAttribute('quantity-box');
    let $qtyInputBox = currentTarget.closest('[data-qty-container]').querySelector('[data-qty-input]');
    let itemNo = $qtyInputBox.dataset.index || 1;
    console.log(itemNo)
    let currentQty = parseInt($qtyInputBox.value) || 1;
    let finalQty = 1;
    console.log(finalQty)
    if (targetName == 'minus' && currentQty <= 1) {
      return false
      console.log("hi-1");
    } else if (targetName == 'minus') {
      finalQty = currentQty - 1
    } else {
      finalQty = currentQty + 1;
    }
    this.updateItemQty(itemNo, finalQty);
    this.headerUpdate();
  }
  onQtyChange(event) {
    const $qtyInputBox = event.currentTarget;
    const qtyValue = $qtyInputBox.value;
    const itemNo = $qtyInputBox.dataset.index || null;
    if (itemNo) this.updateItemQty(itemNo, qtyValue);
  }
  updateItemQty(line, quantity) {
    let lineItem = document.querySelectorAll('[data-cart-item]')[line - 1];
    if (lineItem) {
      lineItem.classList.add('updating');
    }
    const body = JSON.stringify({
      line,
      quantity
    });
    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
    .then((response) => {
      return response.text();
    })
    .then((state) => {
      this.getCartData();
    }).catch((error) => {
      console.log(error);
    });
    this.headerUpdate();
  }
  
  /**
  *  Cart Item Remove
  */
  removeItem(event) {
    event.preventDefault();
    var targetitem = event.currentTarget;
    var lineno = targetitem.getAttribute("data-index");
    fetch(`${routes.cart_change_url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        "line": lineno,
        "quantity": 0
      })
    })
    .then((response) => {
      if (response.status == 200) {
        this.getCartData();
        this.headerUpdate();
      }
      return response.json
    }).catch((err) => {
      console.log(err);
    })
  }
  
  /**
  *  Header Update
  */
  async headerUpdate() {
    var cartdataa = await getCart()
    var data_no = cartdataa.item_count;
    document.getElementById("editCommentsCounter").innerHTML = `<p>${data_no}</p>`;
    var removeItem = document.querySelectorAll('.text-danger')
    removeItem.forEach(button => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById("editCommentsCounter").innerHTML = `<p>${data_no}</p>`;
        if (data_no === 0) {
          console.log("hi")
          document.getElementById("editCommentsCounter").innerHTML = ""
        }
      })
    });
  }
  
  /**
  *  cart Note Update
  */
  cartNoteText() {
    document.querySelector('.cartnote_btn').classList.add("visble_save");
    document.querySelector('.cartnote_btn').innerHTML = "SAVE"
  }
  async cartNote() {
    var cartMessage = document.querySelector("textarea").value;
    const result = await fetch(`${routes.cart_update_url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        note: cartMessage
      })
    });
    if (result.status === 200) {
      document.querySelector('.cartnote_btn').innerHTML = "Added note to Order!"
      this.getCartData();
    }
  }
}
customElements.define("custom-cart-drawer", CustomCart)
async function getCart() {
  const result = await fetch("/cart.js");
  if (result.status === 200) {
    return result.json();
  }
  throw new Error(`Failed to get request, Shopify returned ${result.status} ${result.statusText}`);
}