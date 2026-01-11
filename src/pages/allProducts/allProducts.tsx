import CategoryItem from '@/components/catalog/category-item/category-item';
import ProductCard from '@/components/catalog/product/productCard';
import Sort from '@/components/catalog/sort/sort';
import Spinner from '@/components/catalog/spinner/spinner';
import type I_Category from '@/interfaces/catalog/category';
import type I_Product from '@/interfaces/catalog/product';
import type I_SortedProduct from '@/interfaces/catalog/sortedProduct';
import type I_SubCategory from '@/interfaces/catalog/subCategory';
import createBreadCrumbs from '@/pages/allProducts/createBreadcrumbs';
import createProductData from '@/pages/allProducts/createProductData';
import getCategoriesData from '@/pages/allProducts/getCategoriesData';
import getSearchData from '@/pages/allProducts/getSearchData';
import getSortedProductsData from '@/pages/allProducts/getSortedProductsData';
import { useEffect, useState } from 'react';
import styles from './allProducts.module.scss';

function AllProducts() {
  const [products, setProducts] = useState<I_Product[] | I_SortedProduct[]>([]);
  const [categories, setCategories] = useState<I_Category[]>([]);
  const [subCategories, setSubCategories] = useState<I_SubCategory[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; name: string }[]>([]);
  const [activeCategoryButton, setActiveCategoryButton] = useState<string | null>(null);
  const [sortPrice, setSortPrice] = useState<string | null>(null);
  const [sortName, setSortName] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [checkboxFilters, setCheckboxFilters] = useState<{ name: string; value: string[] }[]>([]);
  const [checkedFilters, setCheckedFilters] = useState<{ [key: string]: boolean }>({});
  const offset = 3;
  const [productsLimit, setProductsLimit] = useState<number>(offset);
  const [isOverload, setIsOverload] = useState<boolean>(false);
  const [isSearchRequest, setIsSearchRequest] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (isSearchRequest) {
      getSearchData({ text: searchText, setProducts, productsLimit, setIsOverload });
    } else {
      getSortedProductsData({
        activeCategoryButton,
        sortPrice,
        sortName,
        setProducts,
        minPrice,
        maxPrice,
        checkboxFilters,
        productsLimit,
        setIsOverload,
      });
    }
  }, [
    isSearchRequest,
    searchText,
    activeCategoryButton,
    sortPrice,
    sortName,
    minPrice,
    maxPrice,
    checkboxFilters,
    productsLimit,
  ]);

  useEffect(() => {
    getCategoriesData({ setCategories, setSubCategories });
  }, []);

  function handleCategoryButton(event: React.MouseEvent) {
    const target = event.target;

    if (target && target instanceof HTMLButtonElement) {
      const id = target.getAttribute('data-id');

      if (id) {
        setActiveCategoryButton(id);

        const breadcrumbs = createBreadCrumbs(categories, subCategories, id);

        setBreadcrumbs(breadcrumbs);
        setProductsLimit(offset);
        setIsOverload(false);
        // temp
        window.history.pushState(
          {},
          '',
          `/products/${encodeURIComponent(target.textContent ?? '')}`,
        );
      }
    }
  }

  function handleSortPriceButton(event: React.ChangeEvent<HTMLInputElement>) {
    setSortPrice(event.target.value);
    setProductsLimit(offset);
    setIsOverload(false);
  }

  function handleSortNameButton(event: React.ChangeEvent<HTMLInputElement>) {
    setSortName(event.target.value);
    setProductsLimit(offset);
    setIsOverload(false);
  }

  function handleSearchInput(event: React.KeyboardEvent) {
    if (event.key !== 'Enter') {
      return;
    }

    setActiveCategoryButton(null);
    setSortPrice(null);
    setSortName(null);
    setMinPrice(null);
    setMaxPrice(null);
    setCheckboxFilters([]);
    setCheckedFilters({});
    setBreadcrumbs([]);
    setProductsLimit(offset);
    setIsOverload(false);

    const target = event.target;

    if (target && target instanceof HTMLInputElement) {
      const text = target.value.trim();
      if (!text) return;

      setIsSearchRequest(true);
      setSearchText(text);
      target.value = '';
    }
  }

  function handleMinPriceInput(event: React.ChangeEvent<HTMLInputElement>) {
    const price = parseFloat(event.target.value);
    console.log('Min price ' + price);
    setMinPrice(price);
    setProductsLimit(offset);
    setIsOverload(false);
  }

  function handleMaxPriceInput(event: React.ChangeEvent<HTMLInputElement>) {
    const price = parseFloat(event.target.value);
    console.log('Max price ' + price);
    setMaxPrice(price);
    setProductsLimit(offset);
    setIsOverload(false);
  }

  function handleCheckboxFilter(event: React.ChangeEvent<HTMLInputElement>) {
    const target = event.target;

    if (target && target instanceof HTMLInputElement) {
      const isChecked = target.checked;

      const filterOptions = {
        name: target.name,
        value: [target.value],
      };

      setProductsLimit(offset);
      setIsOverload(false);

      if (isChecked) {
        setCheckboxFilters(checkboxFilters => {
          const filters = checkboxFilters ? [...checkboxFilters] : [];
          const currentFilter = filters.find(filter => filter.name === filterOptions.name);

          if (currentFilter) {
            const copyCurrentFilter = { ...currentFilter };
            const newValues = [...copyCurrentFilter.value];

            filterOptions.value.forEach(filterValue => {
              if (!newValues.includes(filterValue)) {
                newValues.push(filterValue);
              }
            });

            copyCurrentFilter.value = newValues;

            const newFilters = filters.map(filter => {
              if (filter.name === filterOptions.name) {
                return copyCurrentFilter;
              } else {
                return filter;
              }
            });

            console.log('Checked. Updated filters: ', newFilters);
            return newFilters;
          } else {
            const newFilter = [...filters, filterOptions];
            console.log('Checked. New filter: ', newFilter);
            return newFilter;
          }
        });
      } else {
        setCheckboxFilters(checkboxFilters => {
          const filters = checkboxFilters ? [...checkboxFilters] : [];
          const currentFilter = filters.find(filter => filter.name === filterOptions.name);

          if (currentFilter) {
            const copyCurrentFilter = { ...currentFilter };
            let newValues = [...copyCurrentFilter.value];

            newValues = newValues.filter(filterValue => {
              if (filterValue !== filterOptions.value[0]) {
                return filterValue;
              }
            });

            if (newValues.length === 0) {
              return filters.filter(filter => filter.name !== filterOptions.name);
            } else {
              copyCurrentFilter.value = newValues;

              const newFilters = filters.map(filter => {
                if (filter.name === filterOptions.name) {
                  return copyCurrentFilter;
                } else {
                  return filter;
                }
              });

              console.log('Unchecked. Updated filters: ', newFilters);
              return newFilters;
            }
          } else {
            console.log('Unchecked. Filters: ', filters);
            return filters;
          }
        });
      }
    }
  }

  function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const key = `${e.target.name}:${e.target.value}`;
    setCheckedFilters(state => ({
      ...state,
      [key]: e.target.checked,
    }));

    handleCheckboxFilter(e);
  }

  function handleResetButton() {
    setActiveCategoryButton(null);
    setSortPrice(null);
    setSortName(null);
    setMinPrice(null);
    setMaxPrice(null);
    setCheckboxFilters([]);
    setCheckedFilters({});
    setBreadcrumbs([]);
    setProductsLimit(offset);
    setIsOverload(false);
  }

  function handleLoadMoreButton() {
    setProductsLimit(state => state + offset);
  }

  if (products.length === 0) return <Spinner />;

  return (
    <section className={styles.catalog}>
      <div className="container">
        <div className={styles['search-content']}>
          <div className={styles['search-wrapper']}>
            <input
              className={styles.search}
              type="text"
              name="product-name"
              id="product-name"
              placeholder="Search in products..."
              onKeyDown={handleSearchInput}
            />
          </div>
        </div>
        <div className={styles.breadcrumbs}>
          <ul className={styles['breadcrumbs-list']}>
            {breadcrumbs.map((breadcrumb, i) => (
              <li
                key={i}
                className={`${styles['breadcrumb-item']} ${i === breadcrumbs.length - 1 ? styles['no-arrow'] : ''}`}
              >
                <button
                  data-id={breadcrumb.id}
                  className={styles['breadcrumb-button']}
                  onClick={handleCategoryButton}
                >
                  {breadcrumb.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles['catalog-wrapper']}>
          <div className={styles.filters}>
            <div className={styles.categories}>
              <h2 className={styles.header}>Categories</h2>
              <ul className={styles['categories-list']}>
                {categories.map(category => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    subCategories={subCategories}
                    activeCategoryButton={activeCategoryButton}
                    handleCategoryButton={handleCategoryButton}
                  />
                ))}
              </ul>
            </div>
            <Sort
              key={'sort'}
              handleSortPriceButton={handleSortPriceButton}
              sortPrice={sortPrice}
              handleSortNameButton={handleSortNameButton}
              sortName={sortName}
            />
            {/* temp hardcode, need dynamic build for filters */}
            <div className={styles['price-filter']}>
              <h2 className={styles.header}>Filters</h2>
              <h3 className={styles['sub-header']}>Price range</h3>
              <ul>
                <li className={styles['price-filter-item']}>
                  <label className={styles.label} htmlFor="min-price">
                    Minimum Price
                  </label>
                  <input
                    onChange={handleMinPriceInput}
                    value={minPrice ?? ''}
                    className={styles['price-input']}
                    type="number"
                    id="min-price"
                    min="0"
                    placeholder="Min: 0"
                  ></input>
                </li>
                <li className={styles['price-filter-item']}>
                  <label className={styles.label} htmlFor="max-price">
                    Maximum Price
                  </label>
                  <input
                    onChange={handleMaxPriceInput}
                    value={maxPrice ?? ''}
                    className={styles['price-input']}
                    type="number"
                    id="max-price"
                    max="30"
                    placeholder="Max: 30"
                  ></input>
                </li>
              </ul>
            </div>
            <div className={styles['attributes-filter']}>
              <h3 className={styles['sub-header']}>Brand</h3>
              <ul>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['brand:gucci'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="gucci"
                  >
                    Gucci
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['brand:gucci'] ? true : false}
                    type="checkbox"
                    id="gucci"
                    name="brand"
                    value="gucci"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['brand:prada'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="prada"
                  >
                    Prada
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['brand:prada'] ? true : false}
                    type="checkbox"
                    id="prada"
                    name="brand"
                    value="prada"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['brand:carden'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="carden"
                  >
                    Carden
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['brand:carden'] ? true : false}
                    type="checkbox"
                    id="carden"
                    name="brand"
                    value="carden"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
              </ul>
              <h3 className={styles['sub-header']}>Color</h3>
              <ul>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['color:black'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="black"
                  >
                    Black
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['color:black'] ? true : false}
                    type="checkbox"
                    id="black"
                    name="color"
                    value="black"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['color:white'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="white"
                  >
                    White
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['color:white'] ? true : false}
                    type="checkbox"
                    id="white"
                    name="color"
                    value="white"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
              </ul>
              <h3 className={styles['sub-header']}>Size</h3>
              <ul>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['size:s'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="s"
                  >
                    Small
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['size:s'] ? true : false}
                    type="checkbox"
                    id="s"
                    name="size"
                    value="s"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['size:m'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="m"
                  >
                    Medium
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['size:m'] ? true : false}
                    type="checkbox"
                    id="m"
                    name="size"
                    value="m"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['size:l'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="l"
                  >
                    Large
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['size:l'] ? true : false}
                    type="checkbox"
                    id="l"
                    name="size"
                    value="l"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['size:xl'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="xl"
                  >
                    Extra large
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['size:xl'] ? true : false}
                    type="checkbox"
                    id="xl"
                    name="size"
                    value="xl"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['size:xxl'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="xxl"
                  >
                    Extra extra large
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['size:xxl'] ? true : false}
                    type="checkbox"
                    id="xxl"
                    name="size"
                    value="xxl"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['size:38'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="38"
                  >
                    38
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['size:38'] ? true : false}
                    type="checkbox"
                    id="38"
                    name="size"
                    value="38"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['size:39'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="39"
                  >
                    39
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['size:39'] ? true : false}
                    type="checkbox"
                    id="39"
                    name="size"
                    value="39"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
                <li className={styles['checkbox-item']}>
                  <label
                    className={`${styles['checkbox-label']} ${checkedFilters['size:40'] ? styles['checkbox-label-active'] : ''}`}
                    htmlFor="40"
                  >
                    40
                  </label>
                  <input
                    onChange={handleCheckboxChange}
                    checked={checkedFilters['size:40'] ? true : false}
                    type="checkbox"
                    id="40"
                    name="size"
                    value="40"
                    className={styles['checkbox-input']}
                  ></input>
                </li>
              </ul>
            </div>
            <button onClick={handleResetButton} className={styles['reset-button']}>
              Reset
            </button>
          </div>
          <div className={styles['products-wrapper']}>
            <ul className={styles.products}>
              {products.map(product => {
                const productData = createProductData(product);
                return <ProductCard key={productData.id} product={productData} />;
              })}
            </ul>
            {!isOverload ? (
              <button onClick={handleLoadMoreButton} className={styles['load-more']}>
                More products
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AllProducts;
