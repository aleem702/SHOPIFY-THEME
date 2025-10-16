/**
 * Modern Shopify Theme JavaScript
 * Lightweight, modular, and optimized for performance
 */

(function() {
  'use strict';

  // Global theme object
  window.Theme = {
    // Configuration
    config: {
      cartDrawer: {
        enabled: true,
        autoOpen: false,
        closeOnEscape: true
      },
      animations: {
        enabled: true,
        duration: 300,
        easing: 'ease-in-out'
      },
      lazyLoading: {
        enabled: true,
        threshold: 0.1
      }
    },

    // Utility functions
    utils: {
      // Debounce function
      debounce: function(func, wait, immediate) {
        var timeout;
        return function() {
          var context = this, args = arguments;
          var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
          if (callNow) func.apply(context, args);
        };
      },

      // Throttle function
      throttle: function(func, limit) {
        var inThrottle;
        return function() {
          var args = arguments;
          var context = this;
          if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(function() {
              inThrottle = false;
            }, limit);
          }
        };
      },

      // Format money
      formatMoney: function(cents, format) {
        if (typeof cents === 'string') {
          cents = cents.replace('.', '');
        }
        var value = '';
        var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
        var formatString = format || '${{amount}}';

        function formatWithDelimiters(number, precision, thousands, decimal) {
          thousands = thousands || ',';
          decimal = decimal || '.';

          if (isNaN(number) || number === null) {
            return 0;
          }

          number = (number / 100.0).toFixed(precision);

          var parts = number.split('.');
          var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
          var centsAmount = parts[1] ? (decimal + parts[1]) : '';

          return dollarsAmount + centsAmount;
        }

        switch (formatString.match(placeholderRegex)[1]) {
          case 'amount':
            value = formatWithDelimiters(cents, 2);
            break;
          case 'amount_no_decimals':
            value = formatWithDelimiters(cents, 0);
            break;
          case 'amount_with_comma_separator':
            value = formatWithDelimiters(cents, 2, '.', ',');
            break;
          case 'amount_no_decimals_with_comma_separator':
            value = formatWithDelimiters(cents, 0, '.', ',');
            break;
          case 'amount_no_decimals_with_space_separator':
            value = formatWithDelimiters(cents, 0, ' ');
            break;
          case 'amount_with_apostrophe_separator':
            value = formatWithDelimiters(cents, 2, "'");
            break;
        }

        return formatString.replace(placeholderRegex, value);
      },

      // Get URL parameters
      getUrlParameter: function(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
      },

      // Check if element is in viewport
      isInViewport: function(element) {
        var rect = element.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
      },

      // Smooth scroll to element
      scrollTo: function(element, offset) {
        offset = offset || 0;
        var elementPosition = element.offsetTop - offset;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    },

    // Cart functionality
    cart: {
      // Add item to cart
      addItem: function(variantId, quantity, properties) {
        var data = {
          id: variantId,
          quantity: quantity || 1
        };

        if (properties) {
          data.properties = properties;
        }

        return fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
      },

      // Update cart item
      updateItem: function(line, quantity) {
        return fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            line: line,
            quantity: quantity
          })
        });
      },

      // Remove cart item
      removeItem: function(line) {
        return this.updateItem(line, 0);
      },

      // Get cart data
      getCart: function() {
        return fetch('/cart.js')
          .then(function(response) {
            return response.json();
          });
      },

      // Update cart count
      updateCartCount: function(cart) {
        var cartCount = cart.item_count;
        var cartIcon = document.getElementById('cart-icon-bubble');
        
        if (cartIcon) {
          var countElement = cartIcon.querySelector('.cart-count-bubble');
          if (countElement) {
            countElement.textContent = cartCount;
            countElement.style.display = cartCount > 0 ? 'block' : 'none';
          }
        }
      }
    },

    // Animation functions
    animations: {
      // Fade in animation
      fadeIn: function(element, duration) {
        duration = duration || 300;
        element.style.opacity = '0';
        element.style.display = 'block';
        
        var start = performance.now();
        
        function animate(time) {
          var elapsed = time - start;
          var progress = Math.min(elapsed / duration, 1);
          
          element.style.opacity = progress;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        }
        
        requestAnimationFrame(animate);
      },

      // Fade out animation
      fadeOut: function(element, duration) {
        duration = duration || 300;
        var start = performance.now();
        var startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function animate(time) {
          var elapsed = time - start;
          var progress = Math.min(elapsed / duration, 1);
          
          element.style.opacity = startOpacity * (1 - progress);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            element.style.display = 'none';
          }
        }
        
        requestAnimationFrame(animate);
      },

      // Slide down animation
      slideDown: function(element, duration) {
        duration = duration || 300;
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        var targetHeight = element.scrollHeight;
        var start = performance.now();
        
        function animate(time) {
          var elapsed = time - start;
          var progress = Math.min(elapsed / duration, 1);
          
          element.style.height = (targetHeight * progress) + 'px';
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            element.style.height = 'auto';
            element.style.overflow = 'visible';
          }
        }
        
        requestAnimationFrame(animate);
      },

      // Slide up animation
      slideUp: function(element, duration) {
        duration = duration || 300;
        var startHeight = element.offsetHeight;
        var start = performance.now();
        
        element.style.height = startHeight + 'px';
        element.style.overflow = 'hidden';
        
        function animate(time) {
          var elapsed = time - start;
          var progress = Math.min(elapsed / duration, 1);
          
          element.style.height = (startHeight * (1 - progress)) + 'px';
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            element.style.display = 'none';
            element.style.height = 'auto';
            element.style.overflow = 'visible';
          }
        }
        
        requestAnimationFrame(animate);
      }
    },

    // Lazy loading
    lazyLoading: {
      init: function() {
        if (!Theme.config.lazyLoading.enabled) return;
        
        var images = document.querySelectorAll('img[data-src]');
        var imageObserver = new IntersectionObserver(function(entries, observer) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              var img = entry.target;
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          });
        }, {
          threshold: Theme.config.lazyLoading.threshold
        });

        images.forEach(function(img) {
          imageObserver.observe(img);
        });
      }
    },

    // Sticky header
    stickyHeader: {
      init: function() {
        var header = document.querySelector('.header');
        if (!header) return;

        var headerHeight = header.offsetHeight;
        var lastScrollTop = 0;
        var ticking = false;

        function updateHeader() {
          var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          
          if (scrollTop > headerHeight) {
            header.classList.add('header--sticky');
          } else {
            header.classList.remove('header--sticky');
          }

          if (scrollTop > lastScrollTop && scrollTop > headerHeight) {
            header.classList.add('header--hidden');
          } else {
            header.classList.remove('header--hidden');
          }

          lastScrollTop = scrollTop;
          ticking = false;
        }

        function requestTick() {
          if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
          }
        }

        window.addEventListener('scroll', requestTick);
      }
    },

    // Mobile menu
    mobileMenu: {
      init: function() {
        var menuToggle = document.querySelector('.mobile-menu-toggle');
        var menu = document.querySelector('.mobile-menu');
        var overlay = document.querySelector('.mobile-menu-overlay');

        if (!menuToggle || !menu) return;

        menuToggle.addEventListener('click', function() {
          this.classList.toggle('active');
          menu.classList.toggle('active');
          document.body.classList.toggle('menu-open');
        });

        if (overlay) {
          overlay.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.classList.remove('menu-open');
          });
        }

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape' && menu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.classList.remove('menu-open');
          }
        });
      }
    },

    // Product quick add
    quickAdd: {
      init: function() {
        var quickAddButtons = document.querySelectorAll('.quick-add-button');
        
        quickAddButtons.forEach(function(button) {
          button.addEventListener('click', function(e) {
            e.preventDefault();
            
            var productId = this.dataset.productId;
            var variantId = this.dataset.variantId;
            
            if (!variantId) {
              // Redirect to product page if no variant selected
              var productLink = this.closest('.product-card').querySelector('.product-card__title a');
              if (productLink) {
                window.location.href = productLink.href;
              }
              return;
            }
            
            this.disabled = true;
            this.textContent = 'Adding...';
            
            Theme.cart.addItem(variantId, 1)
              .then(function(response) {
                if (response.ok) {
                  button.textContent = 'Added!';
                  setTimeout(function() {
                    button.disabled = false;
                    button.textContent = 'Quick Add';
                  }, 2000);
                  
                  // Update cart count
                  Theme.cart.getCart().then(function(cart) {
                    Theme.cart.updateCartCount(cart);
                  });
                  
                  // Trigger cart update event
                  document.dispatchEvent(new CustomEvent('cart:updated'));
                } else {
                  throw new Error('Failed to add to cart');
                }
              })
              .catch(function(error) {
                console.error('Error adding to cart:', error);
                button.textContent = 'Error';
                setTimeout(function() {
                  button.disabled = false;
                  button.textContent = 'Quick Add';
                }, 2000);
              });
          });
        });
      }
    },

    // Newsletter signup
    newsletter: {
      init: function() {
        var forms = document.querySelectorAll('.newsletter-form');
        
        forms.forEach(function(form) {
          form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var email = form.querySelector('input[type="email"]').value;
            var button = form.querySelector('button[type="submit"]');
            
            if (!email) {
              alert('Please enter your email address');
              return;
            }
            
            button.disabled = true;
            button.textContent = 'Subscribing...';
            
            // Submit form
            fetch('/contact#contact_form', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                'form_type': 'customer',
                'utf8': '✓',
                'contact[tags]': 'newsletter',
                'contact[email]': email
              })
            })
            .then(function(response) {
              if (response.ok) {
                button.textContent = 'Subscribed!';
                form.querySelector('input[type="email"]').value = '';
              } else {
                throw new Error('Subscription failed');
              }
            })
            .catch(function(error) {
              console.error('Error:', error);
              button.textContent = 'Error';
            })
            .finally(function() {
              setTimeout(function() {
                button.disabled = false;
                button.textContent = 'Subscribe';
              }, 2000);
            });
          });
        });
      }
    },

    // Search functionality
    search: {
      init: function() {
        var searchInput = document.querySelector('.search-input');
        var searchResults = document.querySelector('.search-results');
        
        if (!searchInput) return;
        
        var searchTimeout;
        
        searchInput.addEventListener('input', function() {
          clearTimeout(searchTimeout);
          var query = this.value.trim();
          
          if (query.length < 2) {
            if (searchResults) {
              searchResults.style.display = 'none';
            }
            return;
          }
          
          searchTimeout = setTimeout(function() {
            Theme.search.performSearch(query);
          }, 300);
        });
      },
      
      performSearch: function(query) {
        fetch('/search/suggest.json?q=' + encodeURIComponent(query) + '&resources[type]=product&resources[limit]=5')
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            Theme.search.displayResults(data.resources.results.products);
          })
          .catch(function(error) {
            console.error('Search error:', error);
          });
      },
      
      displayResults: function(products) {
        var searchResults = document.querySelector('.search-results');
        if (!searchResults) return;
        
        if (products.length === 0) {
          searchResults.innerHTML = '<div class="search-no-results">No products found</div>';
        } else {
          var html = products.map(function(product) {
            return '<div class="search-result-item">' +
              '<a href="' + product.url + '">' +
                '<img src="' + product.image + '" alt="' + product.title + '">' +
                '<span>' + product.title + '</span>' +
                '<span class="price">' + Theme.utils.formatMoney(product.price) + '</span>' +
              '</a>' +
            '</div>';
          }).join('');
          
          searchResults.innerHTML = html;
        }
        
        searchResults.style.display = 'block';
      }
    },

    // Initialize all modules
    init: function() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', this.initModules.bind(this));
      } else {
        this.initModules();
      }
    },
    
    initModules: function() {
      // Initialize all modules
      this.lazyLoading.init();
      this.stickyHeader.init();
      this.mobileMenu.init();
      this.quickAdd.init();
      this.newsletter.init();
      this.search.init();
      
      // Initialize cart drawer if it exists
      if (window.cartDrawer) {
        window.cartDrawer.init();
      }
      
      // Add loaded class to body
      document.body.classList.add('theme-loaded');
    }
  };

  // Initialize theme when script loads
  Theme.init();

  // Expose Theme to global scope
  window.Theme = Theme;

})();