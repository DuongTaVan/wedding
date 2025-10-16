if (!Date.now) {
    Date.now = function () {
        return new Date().getTime();
    };
}

// Polyfill requestAnimationFrame
(function () {
    'use strict';
    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vendor = vendors[i];
        window.requestAnimationFrame = window[vendor + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendor + 'CancelAnimationFrame'] ||
            window[vendor + 'CancelRequestAnimationFrame'];
    }

    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) ||
        !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function (callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function () {
                callback(lastTime = nextTime);
            }, nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

// SnowFall effect
var snowFall = (function () {
    function SnowFlakeManager() {
        var defaults = {
            flakeCount: 35,
            flakeColor: '#ffffff',
            flakeIndex: 999999,
            minSize: 1,
            maxSize: 2,
            minSpeed: 1,
            maxSpeed: 5,
            round: false,
            shadow: false,
            collection: false,
            image: false,
            collectionHeight: 40
        };

        var flakes = [];
        var element = {};
        var elementHeight = 0;
        var elementWidth = 0;
        var widthOffset = 0;
        var heightOffset = 0;

        var extend = function (obj, ext) {
            for (var key in ext) {
                if (obj.hasOwnProperty(key)) {
                    obj[key] = ext[key];
                }
            }
        };

        var random = function (min, max) {
            return Math.round(min + Math.random() * (max - min));
        };

        var setStyle = function (el, styles) {
            for (var key in styles) {
                el.style[key] = styles[key] + (key == 'width' || key == 'height' ? 'px' : '');
            }
        };

        var SnowFlake = function (parent, size, speed) {
            this.x = random(widthOffset, elementWidth - widthOffset);
            this.y = random(0, elementHeight);
            this.size = size;
            this.speed = speed;
            this.step = 0;
            this.stepSize = random(1, 10) / 100;

            if (defaults.collection) {
                this.target = canvasCollection[random(0, canvasCollection.length - 1)];
            }

            var flakeEl = null;
            if (defaults.image) {
                flakeEl = new Image();
                flakeEl.src = defaults.image;
            } else {
                flakeEl = document.createElement('div');
                setStyle(flakeEl, {'background': defaults.flakeColor});
            }

            flakeEl.className = 'snowfall-flakes';
            setStyle(flakeEl, {
                'width': this.size,
                'height': this.size,
                'position': 'absolute',
                'top': this.y,
                'left': this.x,
                'fontSize': 0,
                'zIndex': defaults.flakeIndex
            });

            if (defaults.round) {
                setStyle(flakeEl, {
                    '-moz-border-radius': ~~defaults.maxSize + 'px',
                    '-webkit-border-radius': ~~defaults.maxSize + 'px',
                    'borderRadius': ~~defaults.maxSize + 'px'
                });
            }

            if (defaults.shadow) {
                setStyle(flakeEl, {
                    '-moz-box-shadow': '1px 1px 1px #555',
                    '-webkit-box-shadow': '1px 1px 1px #555',
                    'boxShadow': '1px 1px 1px #555'
                });
            }

            if (parent.tagName === document.body.tagName) {
                document.body.appendChild(flakeEl);
            } else {
                parent.appendChild(flakeEl);
            }

            this.element = flakeEl;

            this.update = function () {
                this.y += this.speed;
                if (this.y > elementHeight - (this.size + 6)) {
                    this.reset();
                }
                this.element.style.top = this.y + 'px';
                this.element.style.left = this.x + 'px';
                this.step += this.stepSize;
                this.x += Math.cos(this.step);

                if (this.x + this.size > elementWidth - widthOffset || this.x < widthOffset) {
                    this.reset();
                }
            };

            this.reset = function () {
                this.y = 0;
                this.x = random(widthOffset, elementWidth - widthOffset);
                this.stepSize = random(1, 10) / 100;
                this.size = random(100 * defaults.minSize, 100 * defaults.maxSize) / 100;
                this.element.style.width = this.size + 'px';
                this.element.style.height = this.size + 'px';
                this.speed = random(defaults.minSpeed, defaults.maxSpeed);
            };
        };

        var animationLoop = function () {
            for (var i = 0; i < flakes.length; i += 1) {
                flakes[i].update();
            }
            heightOffset = requestAnimationFrame(function () {
                animationLoop();
            });
        };

        return {
            'snow': function (el, options) {
                extend(defaults, options);
                element = el;
                elementHeight = element.clientHeight;
                elementWidth = element.offsetWidth;
                element.snow = this;

                if ('body' === element.tagName.toLowerCase()) {
                    widthOffset = 25;
                }

                window.addEventListener('resize', function () {
                    elementHeight = element.clientHeight;
                    elementWidth = element.offsetWidth;
                }, false);

                for (i = 0; i < defaults.flakeCount; i += 1) {
                    flakes.push(new SnowFlake(
                        element,
                        random(100 * defaults.minSize, 100 * defaults.maxSize) / 100,
                        random(defaults.minSpeed, defaults.maxSpeed)
                    ));
                }
                animationLoop();
            },
            'clear': function () {
                var flakeElements = null;
                flakeElements = element.getElementsByClassName ?
                    element.getElementsByClassName('snowfall-flakes') :
                    element.querySelectorAll('.snowfall-flakes');

                for (var i = flakeElements.length; i--;) {
                    if (flakeElements[i].parentNode === element) {
                        element.removeChild(flakeElements[i]);
                    }
                }
                cancelAnimationFrame(heightOffset);
            }
        };
    }

    return {
        'snow': function (elements, options) {
            if ('string' == typeof options) {
                if (elements.length > 0) {
                    for (var i = 0; i < elements.length; i++) {
                        if (elements[i].snow) {
                            elements[i].snow.clear();
                        }
                    }
                } else {
                    elements.snow.clear();
                }
            } else {
                if (elements.length > 0) {
                    for (var i = 0; i < elements.length; i++) {
                        new SnowFlakeManager().snow(elements[i], options);
                    }
                } else {
                    new SnowFlakeManager().snow(elements, options);
                }
            }
        }
    };
}());

// Cấu hình hiệu ứng tuyết
SNOW_Picture = biicore.webroot + '/common/imgs/heart.png';
special_custom = ['646f6e3d778825e6f306667f', '64a04f6beb89a210fc07656a'];
window.onload = function () {
    const effects = ['heart', 'snow', 'custom'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    biicore.effect.type = randomEffect;
    setTimeout(function () {
        if (biicore.effect.type == 'heart') {
            let flakeCount = 30;
            if (typeof biicore.template_id !== 'undefined' &&
                special_custom.includes(biicore.template_id)) {
                flakeCount = 5;
                if (window.innerWidth <= 650) {
                    flakeCount = 3;
                }
            }
            snowFall.snow(document.getElementsByTagName('body')[0], {
                'image': SNOW_Picture,
                'minSize': 15,
                'maxSize': 32,
                'flakeCount': flakeCount,
                'maxSpeed': 3,
                'minSpeed': 1
            });
        } else if (biicore.effect.type == 'snow') {
            let flakeCount = 250;
            if (typeof biicore.template_id !== 'undefined' &&
                special_custom.includes(biicore.template_id)) {
                flakeCount = 50;
                if (window.innerWidth <= 1200) {
                    flakeCount = 30;
                }
                if (window.innerWidth <= 650) {
                    flakeCount = 25;
                }
            }
            snowFall.snow(document.getElementsByTagName('body')[0], {
                'round': true,
                'shadow': true,
                'flakeCount': flakeCount,
                'minSize': 1,
                'maxSize': 8
            });
        } else if (biicore.effect.type == 'custom') {
            let flakeCount = 30;
            if (typeof biicore.template_id !== 'undefined' &&
                special_custom.includes(biicore.template_id)) {
                flakeCount = 5;
                if (window.innerWidth <= 650) {
                    flakeCount = 3;
                }
            }
            snowFall.snow(document.getElementsByTagName('body')[0], {
                'image': 'https://cdn.biihappy.com/ziiweb/wedding-snows/14.png',
                'minSize': 15,
                'maxSize': 32,
                'flakeCount': flakeCount,
                'maxSpeed': 3,
                'minSpeed': 1
            });
        }
    }, 300);

    // Hiển thị scroll indicator trên mobile
    if (document.getElementsByTagName('body')[0].clientHeight > window.innerHeight) {
        setTimeout(() => {
            document.querySelector('.mouse-scroll-on-mobile').style.visibility = 'visible';
        }, 800);
    }

    // Xử lý click vào wish suggestions
    showContentWishSuggestions.forEach(function (element) {
        element.addEventListener('click', function (e) {
            e.preventDefault();
            let content = this.textContent || this.innerText;
            document.getElementById('content').value = content;
        });
    });

    // Chặn context menu
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });

    // Chặn F12
    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 123) {
            e.preventDefault();
        }
    });

    // Chặn kéo thả hình ảnh
    function preventImageDrag() {
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('dragstart', function (e) {
                e.preventDefault();
            });
        });
    }

    preventImageDrag();

    document.querySelectorAll('.btn-see-more-gallery').forEach(function (btn) {
        btn.addEventListener('click', function () {
            setTimeout(preventImageDrag, 200);
        });
    });

    document.body.style.webkitTouchCallout = 'none';
};

// Ẩn scroll indicator khi scroll
window.addEventListener('scroll', e => {
    if (window.scrollY > 50) {
        document.querySelector('.mouse-scroll-on-mobile').style.visibility = 'hidden';
    }
});

// Tạo scroll indicator HTML
var scrollDownText = typeof biicore.scroll_down_text != 'undefined' &&
biicore.scroll_down_text !== '' ?
    biicore.scroll_down_text : 'Kéo xuống';

document.write(`
    <style type=text/css>
    .mouse-scroll-on-mobile{display:none;}
    @media screen and (max-width: 576px){
        .mouse-scroll-on-mobile{width:95px;height:30px;margin:0 0 0 -30px;position:fixed;right:calc(50% - 52px);bottom:80px;-webkit-animation:arrow .5s 1s infinite ease-in-out alternate;z-index:999;display:block!important;visibility:hidden}
        .mouse-scroll-on-mobile:hover{-webkit-animation-play-state:paused}
        .mouse-scroll-on-mobile .mouse-scroll-on-mobile-text{text-align:center;bottom:120px;position:absolute;left:1px;background:#fff;padding:5px 10px;border-radius:3px;font-size:15px;color: #000;}
        .mouse-scroll-on-mobile .mouse-scroll-on-mobile-left{position:absolute;height:5px;width:30px;background:#de4659;-webkit-transform:rotate(240deg);bottom:80px;left:42px;-webkit-border-radius:4px;-webkit-transform-origin:5px 50%;-webkit-animation:leftArrow .5s 1s infinite ease-out alternate}
        .mouse-scroll-on-mobile .mouse-scroll-on-mobile-right{position:absolute;height:5px;width:30px;background:#de4659;-webkit-transform:rotate(-60deg);bottom:80px;left:46px;-webkit-border-radius:4px;-webkit-transform-origin:5px 50%;-webkit-animation:rightArrow .5s 1s infinite ease-out alternate}}
        @-webkit-keyframes arrow{0%{bottom:0}100%{bottom:40px}}
        @-webkit-keyframes leftArrow{100%{-webkit-transform:rotate(225deg)}}
        @-webkit-keyframes rightArrow{100%{-webkit-transform:rotate(-45deg)}}
    </style>
    <div class="mouse-scroll-on-mobile">
        <div class="mouse-scroll-on-mobile-text">${scrollDownText}</div>
        <div class="mouse-scroll-on-mobile-left"></div>
        <div class="mouse-scroll-on-mobile-right"></div>
    </div>
`);

// Hiển thị alert nếu có
if (biicore.alert && Object.keys(biicore.alert).length > 0 && biicore.alert.status == 1) {
    biicore.alert.content = biicore.alert.content.replace(
        /(https?:\/\/([-\w\.]+[-\w])+(:\d+)?(\/([w\/_.#-]*(\?\S+)?[^\.\s])?)?)/g,
        '<a href="$1" target="_blank">$1</a>'
    );

    setTimeout(function () {
        Swal.fire({
            'title': biicore.alert.title,
            'html': biicore.alert.content,
            'showCloseButton': false,
            'showConfirmButton': false,
            'showCancelButton': true,
            'focusCancel': true,
            'cancelButtonText': typeof biicore.alert.cancel_button_text != 'undefined' &&
            biicore.alert.cancel_button_text != '' ?
                biicore.alert.cancel_button_text : 'Tắt thông báo'
        });
    }, biicore.alert.timeout);
}

// Xử lý background music
if (biicore.bgMusic) {
    var audioPlayer = document.createElement('AUDIO');
    audioPlayer.style.display = 'none';

    setTimeout(function () {
        if (audioPlayer.canPlayType('audio/mpeg')) {
            audioPlayer.setAttribute('src', biicore.bgMusic);
            document.getElementsByClassName('bii-player')[0].style.display = 'block';
        }
        audioPlayer.volume = 0.3;
        audioPlayer.setAttribute('loop', 'loop');
        audioPlayer.autoplay = true;
        if (biicore.isAutoPlay) {
            audioPlayer.setAttribute('autoplay', 'autoplay');
        }
        document.body.appendChild(audioPlayer);
    }, 1000);

    var myInterval = setInterval(function () {
        if (document.querySelector('.bii-player-secondary, .playerIcon')) {
            setTimeout(function () {
                document.getElementsByClassName('bii-player')[0].classList.add('show-sec');
            }, 2000);
            setTimeout(function () {
                document.getElementsByClassName('bii-player')[0].classList.remove('show-sec');
            }, 7000);
            clearInterval(myInterval);
        }
    }, 200);

    function playPause() {
        document.getElementsByClassName('bii-player')[0].classList.remove('show-sec');
        if (audioPlayer.paused) {
            audioPlayer.play();
            document.getElementById('playerVolumeOff').style.display = 'none';
            document.getElementById('playerVolumeOn').style.display = 'block';
        } else {
            audioPlayer.pause();
            document.getElementById('playerVolumeOff').style.display = 'block';
            document.getElementById('playerVolumeOn').style.display = 'none';
        }
    }

    if (biicore.isAutoPlay) {
        function handleClickAutoPlay() {
            let playerElements = document.querySelectorAll('.bii-player');
            if (!Array.from(playerElements).some(el => el.contains(event.target))) {
                if (audioPlayer.paused) {
                    document.body.removeEventListener('click', handleClickAutoPlay, true);
                    playPause();
                }
            } else {
                document.body.addEventListener('click', handleClickAutoPlay, true);
            }
        }

        document.body.addEventListener('click', handleClickAutoPlay, true);
    }

    document.write(`
        <style type="text/css">
@-webkit-keyframes biilogo-pulse {
  from {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
  50% {
    -webkit-transform: scale3d(0.95, 0.95, 0.95);
    transform: scale3d(0.95, 0.95, 0.95);
  }
  to {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
}

@keyframes biilogo-pulse {
  from {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
  50% {
    -webkit-transform: scale3d(0.95, 0.95, 0.95);
    transform: scale3d(0.95, 0.95, 0.95);
  }
  to {
    -webkit-transform: scale3d(1, 1, 1);
    transform: scale3d(1, 1, 1);
  }
}
.bii-player{position: fixed;bottom: 70px;left: 50px;width: 40px;height: 40px;z-index:99999;display:none;}
.bii-player .playerIcon{cursor:pointer;display: block;width:40px;height:40px;-webkit-border-radius: 50%;-moz-border-radius: 50%;-o-border-radius: 50%;-ms-border-radius: 50%;border-radius: 50%;background-color: #df4758;padding-top: 7px;padding-left: 9px;position:absolute;z-index: 2;}
.bii-player:after{content: "";position: absolute;-webkit-border-radius: 50%;-moz-border-radius: 50%;-o-border-radius: 50%;-ms-border-radius: 50%;border-radius: 50%;z-index: -1;background-color: rgba(242, 59, 67, 0.3);width: 120%;height: 120%;left: -10%;top: -10%;-webkit-animation: biilogo-pulse 1s infinite;animation: biilogo-pulse 1s infinite;z-index: 1;}
.bii-player img{width: 100%;z-index: 99999;position: absolute;cursor:pointer;}
.bii-player.show-sec .bii-player-secondary{visibility: visible;}
.bii-player.show-sec .bii-player-secondary-content{ transform: translate3d(0, 0, 0);}
.bii-player-secondary{position: absolute;width: 310px;left: 25px;height: 50px;overflow: hidden;visibility: hidden;}
.bii-player-secondary-content{display: flex;align-items: center;cursor:pointer;user-select: none;position: absolute;width: 310px;left: -25px;background: #fff;height: 40px;padding: 8px 11px 8px 50px;border: 1px solid #df4759;border-radius: 30px;z-index: 1;font-size:14px;transform: translate3d(-100%, 0, 0);transition: transform 175ms ease;font-family: arial;font-weight: 200;color: #000;}
@media (max-width: 799px) {
  .bii-player{bottom: 30px;left: 20px;}
}
</style>
        <div class="bii-player">
            <div onclick="playPause();" class="bii-player-secondary">
                <div class="bii-player-secondary-content">Click vào đây nếu bạn muốn phát nhạc!</div>
            </div>
            <div onclick="playPause();" class="playerIcon">
                <span id="playerVolumeOff">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="27" fill="#fff" class="bi bi-volume-mute-fill" viewBox="0 0 16 16">
                        <path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708L12.207 8l1.647 1.646a.5.5 0 0 1-.708.708L11.5 8.707l-1.646 1.647a.5.5 0 0 1-.708-.708L10.793 8 9.146 6.354a.5.5 0 1 1 .708-.708L11.5 7.293l1.646-1.647a.5.5 0 0 1 .708 0z"/>
                    </svg>
                </span>
                <span style="display:none;" id="playerVolumeOn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="27" fill="#fff" class="bi bi-volume-up-fill" viewBox="0 0 16 16">
                        <path d="M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                        <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z"/>
                        <path d="M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                    </svg>
                </span>
            </div>
        </div>
    `);
}

// Hiển thị logo Biihappy nếu không phải premium
if (!biicore.isPremium && !biicore.templatePremium) {
    setTimeout(function () {
        document.getElementsByClassName('bii-logo')[0].classList.add('show-sec');
    }, 8000);
    setTimeout(function () {
        document.getElementsByClassName('bii-logo')[0].classList.remove('show-sec');
    }, 11000);
    setTimeout(function () {
        document.getElementsByClassName('bii-logo')[0].classList.add('show-sec');
    }, 25000);
    setTimeout(function () {
        document.getElementsByClassName('bii-logo')[0].classList.remove('show-sec');
    }, 28000);

    var biiLogo = biicore.logo;
    var currentYear = new Date().getFullYear();

    document.write(`
        <style type="text/css">
        /* CSS cho logo Biihappy */
        </style>
        <div class="bii-logo">
            <div class="bii-logo-secondary">
                <div class="bii-logo-secondary-content">${biicore.footer_title_mobile}</div>
            </div>
            <a href="${biicore.url_landing_page}" target="_blank">
                <img src="${biiLogo}" />
            </a>
        </div>
        <div class="bii-footer" style="z-index:9999;background-color: #000;border-top: 1px solid #df4759;color: #fff;text-align: center;letter-spacing: 1px;bottom: 0;width: 100%;font-size: 15px;">
            <div class="container">
                <a style="color: #fff;padding: 10px 0 13px;display: flex;align-items: center;justify-content: center;" href="${biicore.url_landing_page}" target="_blank">
                    <img width="30" src="${biiLogo}" style="border: 1px solid #fff;border-radius: 50%;width:30px!important;margin-right:5px;" />
                    <span class="show-desktop" style="margin-left: 5px;">${biicore.footer_title}</span>
                    <span class="show-mobile">${biicore.footer_title_mobile}</span>
                    <span style="line-height: 15px;vertical-align: middle;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right-short" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                        </svg>
                    </span>
                </a>
            </div>
        </div>
    `);
}

// Xử lý wish suggestions
var showButtonWishSuggestions = document.querySelector('.show-autocomplete');
var hideButtonWishSuggestions = document.querySelector('.hide-autocomplete');
var showContentWishSuggestions = document.querySelectorAll('.showContent');

var toggleDisplayWishesAutocomplete = function (checkDisplay = false) {
    let content = document.querySelector('.wishes-autocomplete-content');
    let isHidden = showButtonWishSuggestions.style.display === 'none';

    if (checkDisplay && !isHidden) return;

    content.style.display = isHidden ? 'none' : '';
    showButtonWishSuggestions.style.display = isHidden ? '' : 'none';
    hideButtonWishSuggestions.style.display = isHidden ? 'none' : '';
};

if (showButtonWishSuggestions && hideButtonWishSuggestions) {
    showButtonWishSuggestions.addEventListener('click', function () {
        toggleDisplayWishesAutocomplete(false);
    });

    hideButtonWishSuggestions.addEventListener('click', function () {
        toggleDisplayWishesAutocomplete(false);
    });

    document.body.addEventListener('click', function (e) {
        if (e.target === document.body ||
            (!showButtonWishSuggestions.contains(e.target) &&
                !hideButtonWishSuggestions.contains(e.target) &&
                !document.getElementById('searchWishSuggestions').contains(e.target) &&
                !Array.from(showContentWishSuggestions).some(function (el) {
                    return el.contains(e.target);
                }))) {
            toggleDisplayWishesAutocomplete(true);
        }
    });
}

// Hàm tìm kiếm wish suggestions
function searchWishSuggestionsFunction() {
    let input, filter, ul, li, a, txtValue, i;
    input = document.getElementById('searchWishSuggestions');
    filter = removeVietnameseTones(input.value.toUpperCase());
    ul = document.getElementById('wishSuggestions');
    li = ul.getElementsByTagName('li');

    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName('a')[0];
        txtValue = a.textContent || a.innerText;
        if (removeVietnameseTones(txtValue.toUpperCase()).indexOf(filter) > -1) {
            li[i].style.display = '';
        } else {
            li[i].style.display = 'none';
        }
    }
}

// Hàm loại bỏ dấu tiếng Việt
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'A');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'E');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'I');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'O');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'U');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'Y');
    str = str.replace(/đ/g, 'D');
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
    str = str.replace(/Đ/g, 'D');
    str = str.replace(/[^a-zA-Z0-9 ]/g, '');
    return str;
}

// Hàm hiển thị toast message cho wishes
function toastMessageWishes(messages = null, scrollTarget = null) {
    if (Array.isArray(messages) && messages.length > 0) {
        $(document).on('click', '.toast-success', function () {
            if (scrollTarget) {
                $('html,body').animate({
                    'scrollTop': $('#' + scrollTarget).offset().top
                }, 'slow');
            }
        });

        toastr.options = {
            'closeButton': true,
            'debug': false,
            'newestOnTop': true,
            'progressBar': false,
            'positionClass': 'toast-top-right',
            'preventDuplicates': false,
            'showDuration': '1000',
            'hideDuration': '1000',
            'timeOut': '5000',
            'extendedTimeOut': '1000',
            'showEasing': 'swing',
            'hideEasing': 'linear',
            'showMethod': 'fadeIn',
            'hideMethod': 'fadeOut'
        };

        let index = 0;
        let interval = setInterval(() => {
            let message = messages[index];
            index++;
            toastr.options.closeHtml = '<button class="closebtn"></button>';
            toastr.success(message.content, message.name);

            if (index >= messages.length) {
                clearInterval(interval);
            }
        }, 5000);
    }
}