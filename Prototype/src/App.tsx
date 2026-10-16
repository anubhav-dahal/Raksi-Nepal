import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type CategoryId = "beer" | "soft" | "snacks" | "hard";
type Screen =
  | { name: "splash" }
  | { name: "home" }
  | {
      name: "category";
      category: CategoryId;
    }
  | { name: "product"; productId: number }
  | { name: "login" }
  | {
      name: "checkout";
    }
  | { name: "success"; reference: string; total: number };

type Product = {
  id: number;
  category: CategoryId;
  name: string;
  size: string;
  price: number;
  image: string;
  description: string;
};

type CartItem = { productId: number; quantity: number };

const images = {
  beer: "https://static.vecteezy.com/system/resources/thumbnails/027/684/075/small/beer-and-grain-background-free-photo.jpg",
  soft: "https://images.pexels.com/photos/4113662/pexels-photo-4113662.jpeg?auto=compress&w=1260&h=750&dpr=1",
  fanta:
    "https://images.unsplash.com/photo-1625740822008-e45abf4e01d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080",
  snacks:
    "https://st5.depositphotos.com/16806292/73694/i/450/depositphotos_736943782-stock-photo-bacon-flavored-potato-chips-bowl.jpg",
  chips:
    "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080",
  hard: "https://images.unsplash.com/photo-1616512050184-a59742ece650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080",
  whiskey:
    "https://images.unsplash.com/photo-1696182736807-5d21e38056ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=85&w=1080",
};

const resolveImage = (source?: string) => source?.trim() || images.chips;

const categories: {
  id: CategoryId;
  name: string;
  subtitle: string;
  image: string;
  alcoholic: boolean;
}[] = [
  {
    id: "beer",
    name: "Beer",
    subtitle: "Chilled & ready",
    image: images.beer,
    alcoholic: true,
  },
  {
    id: "soft",
    name: "Soft Drinks",
    subtitle: "Fizz for every mood",
    image: images.soft,
    alcoholic: false,
  },
  {
    id: "snacks",
    name: "Snacks",
    subtitle: "Crunchy favourites",
    image: images.snacks,
    alcoholic: false,
  },
  {
    id: "hard",
    name: "Hard Drinks",
    subtitle: "Premium selections",
    image: images.hard,
    alcoholic: true,
  },
];

const products: Product[] = [
  {
    id: 1,
    category: "beer",
    name: "Gorkha Premium",
    size: "650 ml bottle",
    price: 340,
    image:
      "https://gorkhabrewery.com/media/pzcotbhj/gok-bottles-1116x320-strong-650ml.png?height=1140&mode=max",
    description:
      "A crisp, refreshing lager with a smooth malt finish. Best served chilled and enjoyed responsibly.",
  },
  {
    id: 2,
    category: "beer",
    name: "Tuborg Strong",
    size: "500 ml can",
    price: 285,
    image:
      "https://gorkhabrewery.com/media/wril11iw/np_tubog-strong.png?height=1140&mode=max",
    description:
      "A full-bodied strong lager with balanced bitterness and a clean, satisfying finish.",
  },
  {
    id: 3,
    category: "soft",
    name: "Coca-Cola",
    size: "500ml can",
    price: 190,
    image:
      "https://media.istockphoto.com/id/458464735/photo/coke.jpg?s=612x612&w=0&k=20&c=YbmiazMmY0DkWh_W8T0pBkOgai2k62hGF1TJn9EC5W0=",
    description:
      "The familiar sparkling cola made for sharing, delivered cold to your doorstep.",
  },
  {
    id: 4,
    category: "soft",
    name: "Fanta",
    size: "500 ml bottle",
    price: 95,
    image:
      "https://www.starquik.com/cdn/shop/files/SQ113287_FOP_a210c62b-e053-4e29-8624-08eeefc02351.jpg?v=1776847492",
    description:
      "Bright, bubbly orange refreshment with a playful fruit flavour and plenty of fizz.",
  },
  {
    id: 5,
    category: "snacks",
    name: "Wai Wai Quick",
    size: "75 g pack",
    price: 30,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBLd7im91rLI8YPwoQheM1TgzayjPtb8OUF4X4GKPKqg&s=10",
    description:
      "Nepal's much-loved instant noodle snack—savory, crunchy, and ready whenever you are.",
  },
  {
    id: 6,
    category: "snacks",
    name: "Lays",
    size: "120 g pack",
    price: 145,
    image: "https://i.ebayimg.com/images/g/XLQAAOSwWWZhFsSQ/s-l1600.webp",
    description:
      "Thin-cut potato chips with a golden crunch and just the right touch of sea salt.",
  },
  {
    id: 7,
    category: "hard",
    name: "Old Durbar Reserve",
    size: "750 ml bottle",
    price: 2450,
    image:
      "https://cheers.com.np/uploads/products/389329599067328761470117598242750366041.png",
    description:
      "A smooth Nepali blended whisky with warm oak notes and a lingering finish. Enjoy responsibly.",
  },
  {
    id: 8,
    category: "hard",
    name: "Khukri XXX Rum",
    size: "750 ml bottle",
    price: 1725,
    image:
      "https://bartenderspiritsawards.com/cont/competitionSubmissions/imagePot/BartenderSpiritsAwardsUS-01222024053904000000-65ae53d80f72a.jpg",
    description:
      "A rich dark rum with caramel warmth and gentle spice, crafted in Nepal. Enjoy responsibly.",
  },
];

const formatNpr = (amount: number) => `NPR ${amount.toLocaleString("en-IN")}`;

function Icon({
  name,
  size = 22,
}: {
  name:
    | "menu"
    | "sun"
    | "moon"
    | "back"
    | "cart"
    | "plus"
    | "minus"
    | "check"
    | "close"
    | "bag"
    | "user"
    | "home";
  size?: number;
}) {
  const paths: Record<string, ReactNode> = {
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    sun: (
      <>
        <circle
          cx="12"
          cy="12"
          r="4"
        />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
      </>
    ),
    moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />,
    back: (
      <>
        <path d="m15 18-6-6 6-6" />
        <path d="M9 12h11" />
      </>
    ),
    cart: (
      <>
        <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20.5 7H6" />
        <circle
          cx="10"
          cy="20"
          r="1"
        />
        <circle
          cx="18"
          cy="20"
          r="1"
        />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    bag: (
      <>
        <path d="M6 8h12l1 13H5L6 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    user: (
      <>
        <circle
          cx="12"
          cy="8"
          r="4"
        />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v11h14V10M9 21v-6h6v6" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo ${compact ? "logo--compact" : ""}`}>
      <svg
        viewBox="0 0 76 76"
        aria-label="Nepalgunj Sips logo"
      >
        <defs>
          <linearGradient
            id="glass"
            x1="0"
            x2="1"
            y1="0"
            y2="1"
          >
            <stop
              offset="0"
              stopColor="#79eadc"
              stopOpacity=".95"
            />
            <stop
              offset="1"
              stopColor="#21b8a6"
              stopOpacity=".45"
            />
          </linearGradient>
        </defs>
        <path
          className="logo-orbit"
          d="M12 39C16 20 29 10 46 12c16 2 24 16 17 31-7 16-25 23-40 15"
        />
        <path
          fill="url(#glass)"
          d="M23 27h34l-4 31a6 6 0 0 1-6 5H33a6 6 0 0 1-6-5l-4-31Z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          d="m47 29 8-18"
        />
        <path
          fill="#f5f7fa"
          fillOpacity=".62"
          d="M29 35c7 4 14-4 22 0l-3 21c-.2 1.2-1.1 2-2.3 2H34.3c-1.2 0-2.1-.8-2.3-2l-3-21Z"
        />
        <circle
          cx="50"
          cy="49"
          r="3.5"
          fill="#21b8a6"
        />
      </svg>
    </div>
  );
}

function AppHeader({
  title,
  onBack,
  onMenu,
  cartCount,
  onCart,
  theme,
  onTheme,
}: {
  title?: string;
  onBack?: () => void;
  onMenu?: () => void;
  cartCount: number;
  onCart: () => void;
  theme: "dark" | "light";
  onTheme: () => void;
}) {
  return (
    <header className="app-header">
      <button
        className="icon-button"
        onClick={onBack || onMenu}
        aria-label={onBack ? "Go back" : "Open menu"}
      >
        <Icon name={onBack ? "back" : "menu"} />
      </button>
      {title ? (
        <h1 className="header-title">{title}</h1>
      ) : (
        <div className="brand-lockup">
          <Logo compact />
          <div>
            <b>Nepalgunj</b>
            <span>SIPS</span>
          </div>
        </div>
      )}
      <div className="header-actions">
        <button
          className="icon-button"
          onClick={onTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          <Icon
            name={theme === "dark" ? "sun" : "moon"}
            size={20}
          />
        </button>
        <button
          className="icon-button cart-button"
          onClick={onCart}
          aria-label={`Cart with ${cartCount} items`}
        >
          <Icon
            name="bag"
            size={21}
          />
          {cartCount > 0 && <span>{cartCount}</span>}
        </button>
      </div>
    </header>
  );
}

function QuantityControl({
  quantity,
  onChange,
  large = false,
}: {
  quantity: number;
  onChange: (value: number) => void;
  large?: boolean;
}) {
  return (
    <div className={`quantity ${large ? "quantity--large" : ""}`}>
      <button
        onClick={() => onChange(Math.max(0, quantity - 1))}
        aria-label="Decrease quantity"
      >
        <Icon
          name="minus"
          size={18}
        />
      </button>
      <b>{quantity}</b>
      <button
        onClick={() => onChange(quantity + 1)}
        aria-label="Increase quantity"
      >
        <Icon
          name="plus"
          size={18}
        />
      </button>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: "splash" });
  const [history, setHistory] = useState<Screen[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("ng-sips-theme") as "dark" | "light") || "dark",
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ageCategory, setAgeCategory] = useState<CategoryId | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [toast, setToast] = useState("");
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [payment, setPayment] = useState("cod");
  const [processing, setProcessing] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (screen.name !== "splash") return;
    const timer = window.setTimeout(() => setScreen({ name: "home" }), 2100);
    return () => window.clearTimeout(timer);
  }, [screen.name]);

  useEffect(() => {
    localStorage.setItem("ng-sips-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product?.price || 0) * item.quantity;
  }, 0);
  const deliveryFee = cart.length ? 80 : 0;
  const total = subtotal + deliveryFee;

  const navigate = (next: Screen, replace = false) => {
    if (!replace) setHistory((value) => [...value, screen]);
    setScreen(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    const previous = history[history.length - 1];
    if (previous) {
      setHistory((value) => value.slice(0, -1));
      setScreen(previous);
    } else {
      setScreen({ name: "home" });
    }
  };

  const goHome = () => {
    setHistory([]);
    setScreen({ name: "home" });
    setMenuOpen(false);
  };

  const openCategory = (category: CategoryId) => {
    const data = categories.find((entry) => entry.id === category);
    if (data?.alcoholic && !ageConfirmed) {
      setAgeCategory(category);
      return;
    }
    navigate({ name: "category", category });
  };

  const mergeIntoCart = (productId: number, quantity: number) => {
    setCart((items) => {
      const existing = items.find((item) => item.productId === productId);
      if (existing) {
        return items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...items, { productId, quantity }];
    });
  };

  const addAndHome = (productId: number) => {
    mergeIntoCart(productId, detailQuantity);
    setToast(
      `${detailQuantity} item${
        detailQuantity > 1 ? "s" : ""
      } added to your cart`,
    );
    setDetailQuantity(1);
    goHome();
  };

  const buyNow = (productId: number) => {
    mergeIntoCart(productId, detailQuantity);
    setDetailQuantity(1);
    navigate(isSignedIn ? { name: "checkout" } : { name: "login" });
  };

  const openCart = () => {
    if (!cart.length) {
      setToast("Your cart is empty—pick something refreshing");
      if (screen.name !== "home") goHome();
      return;
    }
    navigate(isSignedIn ? { name: "checkout" } : { name: "login" });
  };

  const updateCart = (productId: number, quantity: number) => {
    if (quantity === 0) {
      setCart((items) => items.filter((item) => item.productId !== productId));
      return;
    }
    setCart((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const handlePay = () => {
    if (processing || !cart.length) return;
    setProcessing(true);
    const paidTotal = total;
    window.setTimeout(() => {
      const reference = `NJS-${Math.floor(100000 + Math.random() * 900000)}`;
      setCart([]);
      setProcessing(false);
      setHistory([]);
      setScreen({ name: "success", reference, total: paidTotal });
    }, 1600);
  };

  const sharedHeader = (title?: string, showBack = false) => (
    <AppHeader
      title={title}
      onBack={showBack ? goBack : undefined}
      onMenu={!showBack ? () => setMenuOpen(true) : undefined}
      cartCount={cartCount}
      onCart={openCart}
      theme={theme}
      onTheme={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
    />
  );

  const content = useMemo(() => {
    if (screen.name === "splash") {
      return (
        <section className="splash-screen">
          <div className="splash-glow" />
          <div className="splash-logo">
            <Logo />
          </div>
          <div className="splash-copy">
            <p>NEPALGUNJ</p>
            <h1>SIPS</h1>
            <span>Drinks, snacks & good moments</span>
          </div>
          <div className="splash-loader">
            <i />
          </div>
          <small>Nepalgunj, Nepal</small>
        </section>
      );
    }

    if (screen.name === "home") {
      return (
        <>
          {sharedHeader()}
          <main className="screen home-screen">
            <section className="hero-copy">
              <div>
                <span className="eyebrow">DELIVERED IN NEPALGUNJ</span>
                <h1>
                  What are you
                  <br />
                  sipping today?
                </h1>
              </div>
              <div className="delivery-pill">
                <i /> 25–40 min
              </div>
            </section>
            <section
              className="category-list"
              aria-label="Shop by category"
            >
              {categories.map((category, index) => (
                <button
                  className="category-card"
                  style={{ animationDelay: `${index * 70}ms` }}
                  key={category.id}
                  onClick={() => openCategory(category.id)}
                >
                  <img
                    src={resolveImage(category.image)}
                    alt=""
                  />
                  <span className="card-shade" />
                  <span className="category-copy">
                    <small>{category.subtitle}</small>
                    <b>{category.name}</b>
                  </span>
                  <span className="round-arrow">↗</span>
                  {category.alcoholic && (
                    <span className="age-tag">18+ · Enjoy responsibly</span>
                  )}
                </button>
              ))}
            </section>
            <p className="responsible-note">
              Alcohol is intended for adults only. Please enjoy responsibly.
            </p>
          </main>
        </>
      );
    }

    if (screen.name === "category") {
      const category = categories.find(
        (entry) => entry.id === screen.category,
      )!;
      const categoryProducts = products.filter(
        (product) => product.category === screen.category,
      );
      return (
        <>
          {sharedHeader(category.name, true)}
          <main className="screen category-screen">
            <section className="category-banner">
              <img
                src={resolveImage(category.image)}
                alt=""
              />
              <span className="card-shade" />
              <div>
                <small>{category.subtitle}</small>
                <h2>{category.name}</h2>
              </div>
            </section>
            <div className="section-heading">
              <div>
                <span className="eyebrow">OUR PICKS</span>
                <h2>Choose your favourite</h2>
              </div>
              <span>{categoryProducts.length} items</span>
            </div>
            <section className="product-grid">
              {categoryProducts.map((product) => (
                <button
                  className="product-card"
                  key={product.id}
                  onClick={() => {
                    setDetailQuantity(1);
                    navigate({ name: "product", productId: product.id });
                  }}
                >
                  <div className="product-image">
                    <img
                      src={resolveImage(product.image)}
                      alt={product.name}
                    />
                  </div>
                  <div className="product-copy">
                    <small>{product.size}</small>
                    <b>{product.name}</b>
                    <span>{formatNpr(product.price)}</span>
                  </div>
                  <span className="mini-plus">
                    <Icon
                      name="plus"
                      size={17}
                    />
                  </span>
                </button>
              ))}
            </section>
            {category.alcoholic && (
              <p className="responsible-note">
                For adults 18+ only. Enjoy responsibly; never drink and drive.
              </p>
            )}
          </main>
        </>
      );
    }

    if (screen.name === "product") {
      const product = products.find((entry) => entry.id === screen.productId)!;
      const alcoholic =
        product.category === "beer" || product.category === "hard";
      return (
        <>
          <div className="detail-topbar">
            <button
              className="icon-button glass-button"
              onClick={goBack}
              aria-label="Go back"
            >
              <Icon name="back" />
            </button>
            <button
              className="icon-button glass-button cart-button"
              onClick={openCart}
              aria-label="Open cart"
            >
              <Icon
                name="bag"
                size={21}
              />
              {cartCount > 0 && <span>{cartCount}</span>}
            </button>
          </div>
          <main
            className="product-detail"
            style={{ height: "calc(100dvh - 28px)", overflowY: "auto" }}
          >
            <div className="detail-image">
              <img
                src={resolveImage(product.image)}
                alt={product.name}
              />
              <span className="detail-gradient" />
            </div>
            <section
              className="detail-sheet"
              style={{ minHeight: "calc(57dvh - 3px)" }}
            >
              <div className="detail-category">
                {
                  categories.find((entry) => entry.id === product.category)
                    ?.name
                }
              </div>
              <h1>{product.name}</h1>
              <p className="size-label">{product.size}</p>
              <div className="price-row">
                <strong>{formatNpr(product.price)}</strong>
                <QuantityControl
                  quantity={detailQuantity}
                  onChange={(value) => setDetailQuantity(Math.max(1, value))}
                  large
                />
              </div>
              <div className="divider" />
              <h3>About this item</h3>
              <p className="description">{product.description}</p>
              {alcoholic && (
                <p className="alcohol-note">
                  18+ only · Please enjoy responsibly
                </p>
              )}
              <div className="detail-actions">
                <button
                  className="button button--secondary"
                  onClick={() => addAndHome(product.id)}
                >
                  Add to cart
                </button>
                <button
                  className="button button--primary"
                  onClick={() => buyNow(product.id)}
                >
                  Checkout
                </button>
              </div>
            </section>
          </main>
        </>
      );
    }

    if (screen.name === "login") {
      return (
        <>
          {sharedHeader("Sign in", true)}
          <main className="screen login-screen">
            <div className="login-mark">
              <Logo />
            </div>
            <span className="eyebrow">WELCOME TO NEPALGUNJ SIPS</span>
            <h1>Almost at your doorstep.</h1>
            <p>
              Sign in to confirm your delivery details and continue to checkout.
            </p>
            <form
              className="login-form"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const form = event.currentTarget;
                if (!form.checkValidity()) return;
                setIsSignedIn(true);
                setToast("Signed in successfully");
                navigate({ name: "checkout" });
              }}
            >
              <label>
                Mobile number
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  placeholder="98XXXXXXXX"
                  aria-label="Mobile number"
                />
              </label>
              <label>
                Password
                <input
                  required
                  minLength={4}
                  type="password"
                  placeholder="Enter password"
                  aria-label="Password"
                />
              </label>
              <button
                className="button button--primary"
                type="submit"
              >
                Sign in & continue
              </button>
            </form>
            <div className="or">
              <span />
              OR
              <span />
            </div>
            <button
              className="button button--secondary button--demo"
              onClick={() => {
                setIsSignedIn(true);
                setToast("Demo account ready");
                navigate({ name: "checkout" });
              }}
            >
              <Icon
                name="user"
                size={19}
              />{" "}
              Continue with demo account
            </button>
            <small className="simulation-note">
              Prototype only—login is simulated and no credentials are stored.
            </small>
          </main>
        </>
      );
    }

    if (screen.name === "checkout") {
      return (
        <>
          {sharedHeader("Checkout", true)}
          <main className="screen checkout-screen">
            <div className="checkout-intro">
              <span className="eyebrow">ORDER SUMMARY</span>
              <h1>Your delivery</h1>
              <p>Birendra Chowk, Nepalgunj · 25–40 min</p>
            </div>
            <section className="cart-list">
              {cart.map((item) => {
                const product = products.find(
                  (entry) => entry.id === item.productId,
                )!;
                return (
                  <article
                    className="cart-item"
                    key={item.productId}
                  >
                    <img
                      src={resolveImage(product.image)}
                      alt={product.name}
                    />
                    <div className="cart-copy">
                      <b>{product.name}</b>
                      <small>{product.size}</small>
                      <strong>
                        {formatNpr(product.price * item.quantity)}
                      </strong>
                    </div>
                    <QuantityControl
                      quantity={item.quantity}
                      onChange={(value) => updateCart(item.productId, value)}
                    />
                  </article>
                );
              })}
              {!cart.length && (
                <div className="empty-cart">
                  <Icon
                    name="bag"
                    size={34}
                  />
                  <h3>Your cart is empty</h3>
                  <button onClick={goHome}>Browse favourites</button>
                </div>
              )}
            </section>
            {cart.length > 0 && (
              <>
                <section className="bill-card">
                  <div>
                    <span>Subtotal</span>
                    <b>{formatNpr(subtotal)}</b>
                  </div>
                  <div>
                    <span>Delivery fee</span>
                    <b>{formatNpr(deliveryFee)}</b>
                  </div>
                  <div className="bill-total">
                    <span>Total</span>
                    <strong>{formatNpr(total)}</strong>
                  </div>
                </section>
                <section className="payment-section">
                  <span className="eyebrow">PAYMENT</span>
                  <h2>Choose a method</h2>
                  {[
                    ["cod", "Cash on delivery", "Pay when your order arrives"],
                    ["wallet", "Digital wallet", "Simulated wallet payment"],
                  ].map(([value, label, note]) => (
                    <label
                      className={`payment-option ${
                        payment === value ? "selected" : ""
                      }`}
                      key={value}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={value}
                        checked={payment === value}
                        onChange={() => setPayment(value)}
                      />
                      <span className="payment-icon">
                        {value === "cod" ? "रु" : "W"}
                      </span>
                      <span>
                        <b>{label}</b>
                        <small>{note}</small>
                      </span>
                      <i />
                    </label>
                  ))}
                </section>
                <p className="simulation-note">
                  No real payment will be processed. This is a prototype
                  experience.
                </p>
                <button
                  className="button button--primary pay-button"
                  disabled={processing}
                  onClick={handlePay}
                >
                  {processing ? (
                    <>
                      <span className="spinner" /> Processing…
                    </>
                  ) : (
                    <>Pay {formatNpr(total)}</>
                  )}
                </button>
              </>
            )}
          </main>
        </>
      );
    }

    if (screen.name === "success") {
      return (
        <main className="success-screen">
          <div className="success-halo">
            <div className="success-check">
              <Icon
                name="check"
                size={38}
              />
            </div>
          </div>
          <span className="eyebrow">ORDER CONFIRMED</span>
          <h1>
            Refreshment
            <br />
            is on the way.
          </h1>
          <p>
            Thanks for ordering with Nepalgunj Sips. We’ll have your order at
            your door soon.
          </p>
          <section className="reference-card">
            <div>
              <span>Order reference</span>
              <b>{screen.reference}</b>
            </div>
            <div>
              <span>Amount paid</span>
              <strong>{formatNpr(screen.total)}</strong>
            </div>
            <div>
              <span>Estimated delivery</span>
              <b>25–40 min</b>
            </div>
          </section>
          <button
            className="button button--primary"
            onClick={goHome}
          >
            <Icon
              name="home"
              size={19}
            />{" "}
            Back to home
          </button>
          <small>Payment and delivery are simulated for this prototype.</small>
        </main>
      );
    }
    return null;
  }, [
    screen,
    theme,
    cart,
    cartCount,
    subtotal,
    total,
    deliveryFee,
    detailQuantity,
    payment,
    processing,
    isSignedIn,
  ]);

  return (
    <div className={`app ${theme}`}>
      <div className="phone-shell">
        <div className="status-bar">
          <span>9:41</span>
          <span>● ◒ ▰</span>
        </div>
        {content}
        {menuOpen && (
          <div
            className="drawer-layer"
            onClick={() => setMenuOpen(false)}
          >
            <aside
              className="drawer"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="drawer-head">
                <div className="brand-lockup">
                  <Logo compact />
                  <div>
                    <b>Nepalgunj</b>
                    <span>SIPS</span>
                  </div>
                </div>
                <button
                  className="icon-button"
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon name="close" />
                </button>
              </div>
              <p>Drinks and snacks, delivered with care.</p>
              <nav>
                <button onClick={goHome}>
                  <Icon name="home" /> Home
                </button>
                <button onClick={openCart}>
                  <Icon name="bag" /> Your cart <span>{cartCount}</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate({ name: "login" });
                  }}
                >
                  <Icon name="user" /> {isSignedIn ? "Account" : "Demo sign in"}
                </button>
              </nav>
              <div className="drawer-theme">
                <span>Appearance</span>
                <button
                  onClick={() =>
                    setTheme((value) => (value === "dark" ? "light" : "dark"))
                  }
                >
                  <Icon
                    name={theme === "dark" ? "sun" : "moon"}
                    size={18}
                  />{" "}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
              </div>
              <small>
                Alcohol is for adults 18+ only.
                <br />
                Please enjoy responsibly.
              </small>
            </aside>
          </div>
        )}
        {ageCategory && (
          <div className="modal-layer">
            <section className="age-modal">
              <div className="age-symbol">
                18<span>+</span>
              </div>
              <span className="eyebrow">AGE CONFIRMATION</span>
              <h2>Are you 18 or older?</h2>
              <p>
                Alcoholic categories are intended for adults only. Please
                confirm your age to continue.
              </p>
              <button
                className="button button--primary"
                onClick={() => {
                  const category = ageCategory;
                  setAgeConfirmed(true);
                  setAgeCategory(null);
                  navigate({ name: "category", category });
                }}
              >
                Yes, I am 18 or older
              </button>
              <button
                className="text-button"
                onClick={() => setAgeCategory(null)}
              >
                No, take me back
              </button>
              <small>Please enjoy responsibly. Never drink and drive.</small>
            </section>
          </div>
        )}
        {toast && (
          <div className="toast">
            <span>
              <Icon
                name="check"
                size={16}
              />
            </span>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
