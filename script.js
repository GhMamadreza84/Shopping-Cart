// ELEMENTS
const cartButton = document.getElementById("header-cart-btn");
const productContainer = document.getElementById("product-list-container");
const cartContainer = document.querySelector(".cart-container");
const headerLink = document.querySelector(".header-link");
const conditionText = document.querySelector(".condition-text");
const productList = document.getElementById("product-list");
const clearAllButton = document.getElementById("clear-all-btn");
const cartTable = document.getElementById("cart-table");
const checkOutBox = document.querySelector(".checkout-box");
const quantityText = document.querySelector(".quantity-text");
const cartTotal = document.getElementById("cart-total");
const checkOutButton = document.getElementById("checkout-btn");
const categoryButtonsParent = document.getElementById("category-buttons");
const categoryButtonsContainer = document.querySelector(
  ".category-buttons-wrapper"
);
const searchInput = document.getElementById("search-input");
let cartData = JSON.parse(localStorage.getItem("cart")) || [];
// EVENTS

// SHOW BASKET CART
cartButton.addEventListener("click", () => {
  productContainer.classList.remove("show-section");
  cartContainer.classList.add("show-section");
  searchInput.style.display = "none";
});

// SHOW PRODUCT LIST
headerLink.addEventListener("click", (e) => {
  e.preventDefault();
  productContainer.classList.add("show-section");
  cartContainer.classList.remove("show-section");
});

// FETCH & GET PRODUCT FROM API
const getProducts = async () => {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const data = await response.json();

    conditionText.style.display = "none"; // HIDE LOADING WHEN DATA ARRIVED
    renderProducts(data); // SHOW PRODUCTS
    productList.classList.add("full-list");
    categoryButtonsContainer.style.display = "block";
    // GET ALL PRODUCTS CATEGORY TO CREATE ITS CATEGORY BUTTONS
    const categories = data.reduce(
      (acc, item) => {
        if (!acc.includes(item.category)) {
          acc.push(item.category);
        }
        return acc;
      },
      ["All"]
    );
    // RENDER PRODUCT CATEGORY BUTTONS
    renderCategoryButtons(categories);
  } catch (error) {
    conditionText.textContent = ` ${error.message}`;
    productList.classList.remove("full-list");
  }
};

// FUNCTION TO RENDER PRODUCT IN DOM
const renderProducts = (products) => {
  productList.innerHTML = "";
  products.map((product) => {
    // CREATE PRODUCT ITEM
    const productELement = document.createElement("div");
    productELement.className = "product";

    // DESTRUCTER PRODUCT INFO
    const { image, description, title, price, id } = product;

    productELement.innerHTML = `
    <div class="product-img-wrapper">
        <img
            src="${image}"
            alt="${shortenTitle(title)}"
            class="product-img"
        />
        <div class="product-description">
            <p>${description}</p>
        </div>
    </div>
    <h3 class="product-name">${shortenTitle(title)}</h3>
    <div class="product-info-box">
        <p class="product-price">${price}$</p>
        <div>
            <button class="add-to-cart-btn" data-id="${id}">Add To Cart</button>
        </div>
    </div>
    `;

    //  CLICK EVENT INTO "ADD TO CART BTN "
    const addToCartBtn = productELement.querySelector(".add-to-cart-btn");
    addToCartBtn.addEventListener("click", (e) => {
      const productId = parseInt(e.target.getAttribute("data-id"));

      // ADD SELECTED PRODUCT INTO BASKET CART
      const selectedProduct = products.find((product) => {
        return product.id === productId;
      });
      addToCart(selectedProduct);
    });
    productList.appendChild(productELement);
  });
  if (products.length === 0) {
    conditionText.style.display = "block";
    conditionText.innerHTML = "Product Doesn't Exist!";
    productList.classList.remove("full-list");
  } else {
    conditionText.style.display = "none";
    conditionText.innerHTML = "";
    productList.classList.add("full-list");
  }
};

// FUNCTION RENDER CATEGORY BUTTONS
const renderCategoryButtons = (categories) => {
  categoryButtonsParent.innerHTML = "";
  categories.map((category) => {
    const categoryButton = `
      <button class="category-btn ${category === "All" ? "active" : ""}"
      onClick="searchProductByCategory(this)"
      data-category="${category}"
      >
          ${capitalizeFirstLetter(category)}
      </button>
    `;

    categoryButtonsParent.innerHTML += categoryButton;
  });
};

const searchProductByCategory = async (btn) => {
  const allButtons = document.querySelectorAll(".category-btn");
  allButtons.forEach((btn) => {
    btn.classList.remove("active");
  });
  btn.classList.add("active");
  const category = btn.getAttribute("data-category");
  // FETCH TO API TO FILTER ITS PRODUCTS
  const response = await fetch("https://fakestoreapi.com/products");
  const data = await response.json();
  // GET ALL FILTERED PRODUCTS
  const filteredProducts = data.filter((item) => {
    return item.category === category;
  });

  if (category === "All") {
    getProducts();
  } else {
    renderProducts(filteredProducts);
  }
  // EMPTY SEARCH INPUT
  searchInput.value = "";
};

// FUNCTION TO UPPER CASE FIRST LETTER OF PRODUCT NAME
const capitalizeFirstLetter = (productName) => {
  const firtsLetter = productName.charAt(0).toUpperCase();
  const newProductName = ` ${firtsLetter}${productName.slice(1)}`;
  return newProductName;
};

//  FUNCTION TO ADD PRODUCT INTO BASKET CART
const addToCart = (product) => {
  //  SEE IF PRODUCT EXIST IN CART OR IT'S NEW PRODUCT
  const cartItem = cartData.find((item) => item.id === product.id);
  if (!cartItem) {
    cartData.push({ ...product, quantity: 1 });
  } else {
    cartItem.quantity++;
  }
  //  SAVE CART ITEMS IN LOCAL STORAGE
  saveProductIntoLocalStorage();
  //  RENDER BASKET CART
  renderCart();
};

const renderCart = () => {
  cartTable.innerHTML = "";
  if (cartData.length !== 0) {
    cartData.map((item) => {
      const { image, title, price, quantity, id } = item;
      const cartElement = document.createElement("div");
      cartElement.className = "cart-item";

      cartElement.innerHTML = `
        <td>
          <img src=${image} alt=${shortenTitle(title)} class="cart-img" />  
        </td>
        <td>
          <h3 class="cart-name">${shortenTitle(title)}</h3>
        </td>
        <td>
          <p class="cart-name">$${price.toFixed(2)}</p>
        </td>
        <td>
          <div class="cart-buttons">
            <button class="btn increase-btn">
              <i class="fa fa-plus"></i>
            </button>
            <p class="cart-quantity">${quantity}</p>
            <button class="btn decrease-btn">
              <i class="fa fa-minus"></i>
            </button>
          </div>
        </td>
        <td>
          <button class="remove-btn">
            <i class="fa fa-times"></i>
          </button>
        </td>
  
      `;
      // EVENT LISTENER TO INCREASE & DECREASE & REMOVE ITEMS
      const increaseButton = cartElement.querySelector(".increase-btn");
      const decreaseButton = cartElement.querySelector(".decrease-btn");
      const removeButton = cartElement.querySelector(".remove-btn");
      // INCREASE BUTTON EVENT
      increaseButton.addEventListener("click", () => {
        increaseQuantity(item);
      });

      // DECREASE BUTTON EVENT
      decreaseButton.addEventListener("click", () => {
        decreaseQuantity(item);
      });
      // REMOVE ITEM EVENT
      removeButton.addEventListener("click", () => {
        removeFromCart(item);
      });
      cartTable.appendChild(cartElement);
    });
    checkOutBox.classList.add("show-checkout-box");
  } else {
    cartTable.innerHTML = `
    <div>
      <h3 class="empty-cart-text">Shopping Cart Is Empty</h3>
      <a href="" class="back-to-shop-link">Back To Shop</a>
    </div>
    `;

    // HIDE CHECKOUT BOX WHEN CART IS EMPTY
    checkOutBox.classList.remove("show-checkout-box");
    // BACK TO SHPO LINK
    const backToShopLink = cartTable.querySelector(".back-to-shop-link");
    backToShopLink.addEventListener("click", () => {
      e.preventDefault();
      headerLink.click();
    });
  }
  // SHOW PRICE IN CHECKOUT BOX
  const totalPrice = cartData.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);
  cartTotal.textContent = totalPrice.toLocaleString();

  quantityText.textContent = cartData.length;
};
// FUNTION TO INCREASE ITEM QUANTITY
const increaseQuantity = (item) => {
  const cartItem = cartData.find((product) => product.id === item.id);

  if (cartItem) {
    cartItem.quantity++;
    renderCart();
    saveProductIntoLocalStorage();
  }
};
// FUNCTION TO DECREASE ITEM QUANTITY
const decreaseQuantity = (item) => {
  const cartItem = cartData.find((product) => product.id === item.id);

  if (cartItem && cartItem.quantity > 1) {
    cartItem.quantity--;
    renderCart();
    saveProductIntoLocalStorage();
  } else {
    Swal.fire({
      icon: "error",
      text: "You cannot reduce the number of products to less than 1 !",
    });
  }
};
// FUNCTION TO REMOVE ITEM FROM BASKET CART
const removeFromCart = (item) => {
  const index = cartData.findIndex((product) => product.id === item.id);
  if (index !== 1) {
    cartData.splice(index, 1);
    renderCart();
    saveProductIntoLocalStorage();
  }
};

// CLEAR BASKET CART WHEN CLICK CLEAR ALL BUTTON
clearAllButton.addEventListener("click", () => {
  Swal.fire({
    title: "Are you sure to clear basket cart ?",
    showDenyButton: true,
    confirmButtonText: "Clear",
    denyButtonText: `Cancel`,
  }).then((result) => {
    if (result.isConfirmed) {
      cartData = [];
      saveProductIntoLocalStorage();
      renderCart();
    }
  });
});
// CHECK OUT BASKET CART WHEN CLICK CLEAR ALL BUTTON
checkOutButton.addEventListener("click", () => {
  Swal.fire({
    title: "Checkout Succesfuly Done!",
    position: "center",
    icon: "success",
    showConfirmButton: false,
    timer: 3000,
  });
  cartData = [];
  renderCart();
  saveProductIntoLocalStorage();
});
// FILTER PRODUCT BY SEARCHING
searchInput.addEventListener("input", async (e) => {
  const value = e.target.value;
  const selectedProducts = await filterProductBySearch(value);
  renderProducts(selectedProducts);
});
// GET SEARCHED PRODUCT FROM API
const filterProductBySearch = async (value) => {
  const response = await fetch("https://fakestoreapi.com/products");
  const data = await response.json();
  // FILTERING
  const searchedProducts = data.filter((product) => {
    return shortenTitle(product.title)
      .toLowerCase()
      .includes(value.toLowerCase().trim());
  });
  return searchedProducts;
};
//  FUNCTION TO SAVE CART PRODUCT IN LOACL STORAGE
const saveProductIntoLocalStorage = () => {
  localStorage.setItem("cart", JSON.stringify(cartData));
};

const shortenTitle = (title) => {
  const splitedTitled = title.split(" ");
  let newTitle = null;
  if (splitedTitled[1] === "-") {
    newTitle = `${splitedTitled[0]} ${splitedTitled[1]} ${splitedTitled[2]}`;
  } else {
    newTitle = `${splitedTitled[0]} ${splitedTitled[1]}`;
  }
  return newTitle;
};

// START INITIALY PROJECT
getProducts();
renderCart();
