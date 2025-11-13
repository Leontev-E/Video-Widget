(function (doc, win) {
    'use strict';

    var cfg = Object.assign({
        videos: [],
        videoSrc: '22.mp4',
        position: 'bottom-left',
        gutter: 50,
        hoverScale: 1.12,
        smallSize: { width: 130, height: 180 },
        smallSizeMobile: { width: 94, height: 129 },
        expandedSize: { width: 312, height: 560 },
        expandedSizeMobile: { width: 279, height: 500 },
        smallRadius: 18,
        largeRadius: 32,
        glassBorderColor: 'rgba(255,255,255,0.25)',
        glassBorderColorActive: 'rgba(120,168,255,0.6)',
        controlsGlass: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(156,190,255,0.7))',
        ctaText: '',
        ctaHref: '',
        ctaDelay: 2000,
        accessibleLabel: 'Видеоотзыв клиента'
    }, win.LocalVideoWidgetConfig || {});

    var FOCUSABLE_SELECTOR = 'a[href], button, [tabindex]:not([tabindex="-1"])';

    function buildPlaylist() {
        var list = [];

        if (Array.isArray(cfg.videos)) {
            cfg.videos.forEach(function (item) {
                if (!item) return;
                if (typeof item === 'string') {
                    list.push({ src: item.trim() });
                    return;
                }
                if (item.src) {
                    list.push({
                        src: item.src.trim(),
                        caption: item.caption || item.title || '',
                        avatar: item.avatar || '',
                        poster: item.poster || ''
                    });
                }
            });
        }

        if (!list.length && typeof cfg.videoSrc === 'string') {
            cfg.videoSrc.split(',').forEach(function (src) {
                var trimmed = (src || '').trim();
                if (trimmed) list.push({ src: trimmed });
            });
        }

        return list;
    }

    function createStyles() {
        if (doc.getElementById('gvw-styles')) return;
        var alignProp = cfg.position === 'bottom-right' ? 'right' : 'left';
        var hoverScale = Math.max(1.01, Number(cfg.hoverScale) || 1.12);
        var css = [
            '.gvw-widget{',
            'position:fixed;',
            'z-index:2147480000;',
            'bottom:' + cfg.gutter + 'px;',
            alignProp + ':' + cfg.gutter + 'px;',
            'width:var(--gvw-small-w);',
            'height:var(--gvw-small-h);',
            'border-radius:var(--gvw-small-r);',
            'overflow:hidden;',
            'box-shadow:0 25px 60px rgba(3,8,20,0.55);',
            'transition:width .32s ease,height .32s ease,transform .22s ease,border-radius .28s ease;',
            'transform-origin:bottom ' + (cfg.position === 'bottom-right' ? 'right' : 'left') + ';',
            'cursor:pointer;',
            'background:transparent;',
            'outline:none;',
            '}',
            '.gvw-widget:focus-visible{outline:2px solid rgba(120,168,255,0.9);outline-offset:4px;}',
            '.gvw-widget:hover:not(.gvw-expanded){transform:scale(' + hoverScale + ');}',
            '.gvw-widget.gvw-expanded{width:var(--gvw-large-w);height:var(--gvw-large-h);border-radius:var(--gvw-large-r);cursor:default;}',
            '.gvw-frame{position:relative;width:100%;height:100%;border-radius:inherit;overflow:hidden;border:5px solid ' + cfg.glassBorderColor + ';background:rgba(4,8,20,0.35);backdrop-filter:blur(18px);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.25);}',
            '.gvw-frame::after{content:\"\";position:absolute;inset:0;border-radius:inherit;border:1px solid rgba(255,255,255,0.35);pointer-events:none;opacity:0.8;}',
            '.gvw-expanded .gvw-frame{border-color:' + cfg.glassBorderColorActive + ';box-shadow:0 35px 75px rgba(2,6,18,0.65), inset 0 0 0 1px rgba(255,255,255,0.4);}',
            '.gvw-video{width:100%;height:100%;object-fit:cover;display:block;}',
            '.gvw-hide-btn{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:16px;border:1px solid rgba(255,255,255,0.45);background:rgba(255,255,255,0.12);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;color:#fff;font-size:19px;line-height:1;opacity:0;pointer-events:none;transition:opacity .2s ease;}',
            '.gvw-widget:hover .gvw-hide-btn{opacity:1;pointer-events:auto;}',
            '.gvw-expanded .gvw-hide-btn{display:none;}',
            '.gvw-controls{position:absolute;top:14px;right:14px;display:flex;flex-direction:column;gap:12px;align-items:flex-end;opacity:0;pointer-events:none;transition:opacity .2s ease;}',
            '.gvw-expanded .gvw-controls{opacity:1;pointer-events:auto;}',
            '.gvw-time-chip{min-width:68px;text-align:center;padding:6px 12px;border-radius:999px;background:' + cfg.controlsGlass + ';color:#0b1326;font-weight:600;font-family:\"Inter\",system-ui,sans-serif;font-size:13px;border:1px solid rgba(255,255,255,0.7);box-shadow:0 12px 28px rgba(5,9,22,0.45);}',
            '.gvw-action{width:40px;height:40px;border-radius:14px;border:1px solid rgba(255,255,255,0.65);background:' + cfg.controlsGlass + ';backdrop-filter:blur(18px);display:flex;align-items:center;justify-content:center;color:#0a142e;font-size:18px;cursor:pointer;transition:background .2s ease,color .2s ease,transform .2s ease;}',
            '.gvw-action:hover{background:linear-gradient(135deg, rgba(255,255,255,0.95), rgba(190,214,255,0.85));}',
            '.gvw-action:active{transform:scale(.94);}',
            '.gvw-sound-muted span{position:relative;display:inline-block;}',
            '.gvw-sound-muted span::after{content:\"\";position:absolute;left:0;right:0;height:2px;background:#0b1326;transform:rotate(-45deg);top:50%;}',
            '.gvw-cta{position:absolute;left:18px;right:18px;bottom:18px;display:flex;opacity:0;transform:translateY(16px);pointer-events:none;transition:opacity .32s ease,transform .32s ease;}',
            '.gvw-widget.gvw-expanded.gvw-cta-ready .gvw-cta{opacity:1;transform:translateY(0);pointer-events:auto;}',
            '.gvw-cta-btn{flex:1;padding:14px 18px;border-radius:20px;text-align:center;text-decoration:none;font-weight:600;font-size:15px;color:#061129;background:linear-gradient(135deg, rgba(255,255,255,0.9), rgba(176,206,255,0.8));border:1px solid rgba(255,255,255,0.7);backdrop-filter:blur(24px);box-shadow:0 22px 45px rgba(3,6,18,0.55), inset 0 1px 0 rgba(255,255,255,0.8);}',
            '.gvw-cta-btn:hover{background:linear-gradient(135deg, rgba(255,255,255,0.98), rgba(198,220,255,0.9));}',
            '.gvw-chip{position:absolute;left:16px;bottom:16px;display:flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;background:rgba(5,9,22,0.72);color:#fff;font-size:13px;line-height:1.3;box-shadow:0 12px 28px rgba(2,6,18,0.55);opacity:0;pointer-events:none;transition:opacity .2s ease;}',
            '.gvw-chip.gvw-chip-visible{opacity:1;}',
            '.gvw-chip-avatar{width:32px;height:32px;border-radius:50%;background-size:cover;background-position:center;border:2px solid rgba(255,255,255,0.75);display:none;}',
            '.gvw-chip-avatar.gvw-chip-avatar-visible{display:block;}',
            '.gvw-widget.gvw-expanded .gvw-chip{opacity:0;}',
            '.gvw-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0;}',
            '.gvw-hidden{display:none !important;}',
            '@media(max-width:640px){',
            '.gvw-widget{width:var(--gvw-small-w-m);height:var(--gvw-small-h-m);}',
            '.gvw-widget.gvw-expanded{width:var(--gvw-large-w-m);height:var(--gvw-large-h-m);}',
            '.gvw-controls{top:10px;right:10px;gap:8px;}',
            '.gvw-time-chip{font-size:12px;padding:4px 9px;}',
            '.gvw-action{width:36px;height:36px;font-size:16px;}',
            '.gvw-hide-btn{width:30px;height:30px;font-size:16px;}',
            '.gvw-cta{left:14px;right:14px;bottom:12px;}',
            '}'
        ].join('');

        var style = doc.createElement('style');
        style.id = 'gvw-styles';
        style.appendChild(doc.createTextNode(css));
        doc.head.appendChild(style);
    }

    function formatTime(seconds) {
        if (!isFinite(seconds)) return '00:00';
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function ready(fn) {
        if (doc.readyState === 'complete' || doc.readyState === 'interactive') {
            fn();
        } else {
            doc.addEventListener('DOMContentLoaded', fn);
        }
    }

    function initWidget(playlist) {
        var root = doc.createElement('div');
        root.className = 'gvw-widget';
        root.setAttribute('tabindex', '0');
        root.setAttribute('role', 'complementary');
        root.setAttribute('aria-expanded', 'false');
        root.setAttribute('aria-label', cfg.accessibleLabel);

        root.style.setProperty('--gvw-small-w', cfg.smallSize.width + 'px');
        root.style.setProperty('--gvw-small-h', cfg.smallSize.height + 'px');
        root.style.setProperty('--gvw-small-r', cfg.smallRadius + 'px');
        root.style.setProperty('--gvw-large-w', cfg.expandedSize.width + 'px');
        root.style.setProperty('--gvw-large-h', cfg.expandedSize.height + 'px');
        root.style.setProperty('--gvw-large-r', cfg.largeRadius + 'px');
        root.style.setProperty('--gvw-small-w-m', cfg.smallSizeMobile.width + 'px');
        root.style.setProperty('--gvw-small-h-m', cfg.smallSizeMobile.height + 'px');
        root.style.setProperty('--gvw-large-w-m', cfg.expandedSizeMobile.width + 'px');
        root.style.setProperty('--gvw-large-h-m', cfg.expandedSizeMobile.height + 'px');

        var frame = doc.createElement('div');
        frame.className = 'gvw-frame';

        var video = doc.createElement('video');
        video.className = 'gvw-video';
        video.loop = false;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.preload = 'auto';
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('muted', '');
        video.setAttribute('aria-label', 'Видео отзыв');
        frame.appendChild(video);

        var srStatus = doc.createElement('div');
        srStatus.className = 'gvw-sr-only';
        srStatus.setAttribute('aria-live', 'polite');
        srStatus.setAttribute('aria-atomic', 'true');
        root.appendChild(srStatus);

        var chip = doc.createElement('div');
        chip.className = 'gvw-chip';
        chip.setAttribute('aria-live', 'polite');
        var chipAvatar = doc.createElement('span');
        chipAvatar.className = 'gvw-chip-avatar';
        var chipText = doc.createElement('span');
        chipText.className = 'gvw-chip-text';
        chip.appendChild(chipAvatar);
        chip.appendChild(chipText);
        frame.appendChild(chip);

        var hoverClose = doc.createElement('button');
        hoverClose.type = 'button';
        hoverClose.className = 'gvw-hide-btn';
        hoverClose.innerHTML = '&times;';
        hoverClose.setAttribute('aria-label', 'Скрыть мини-плеер');
        hoverClose.addEventListener('click', function (ev) {
            ev.stopPropagation();
            hideWidget();
        });
        frame.appendChild(hoverClose);

        var controls = doc.createElement('div');
        controls.className = 'gvw-controls';

        var timeChip = doc.createElement('div');
        timeChip.className = 'gvw-time-chip';
        timeChip.textContent = '00:00';
        timeChip.setAttribute('role', 'status');
        timeChip.setAttribute('aria-live', 'off');
        controls.appendChild(timeChip);

        var collapseBtn = doc.createElement('button');
        collapseBtn.type = 'button';
        collapseBtn.className = 'gvw-action';
        collapseBtn.setAttribute('aria-label', 'Свернуть видео (Esc или C)');
        collapseBtn.setAttribute('aria-keyshortcuts', 'Escape C');
        collapseBtn.innerHTML = '&times;';
        collapseBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            collapse();
        });
        controls.appendChild(collapseBtn);

        var soundBtn = doc.createElement('button');
        soundBtn.type = 'button';
        soundBtn.className = 'gvw-action';
        soundBtn.setAttribute('aria-label', 'Включить звук (клавиша M)');
        soundBtn.setAttribute('aria-keyshortcuts', 'M');
        soundBtn.setAttribute('aria-pressed', 'false');
        soundBtn.innerHTML = '<span>&#128266;</span>';
        soundBtn.addEventListener('click', function (ev) {
            ev.stopPropagation();
            toggleSound();
        });
        controls.appendChild(soundBtn);

        frame.appendChild(controls);

        var ctaWrap = null;
        var parsedDelay = parseInt(cfg.ctaDelay, 10);
        var ctaDelayMs = isFinite(parsedDelay) ? Math.max(0, parsedDelay) : 2000;
        if (cfg.ctaText && cfg.ctaHref) {
            ctaWrap = doc.createElement('div');
            ctaWrap.className = 'gvw-cta';
            var ctaBtn = doc.createElement('a');
            ctaBtn.className = 'gvw-cta-btn';
            ctaBtn.href = cfg.ctaHref;
            ctaBtn.textContent = cfg.ctaText;
            ctaBtn.setAttribute('role', 'button');
            ctaBtn.setAttribute('aria-label', cfg.ctaAriaLabel || cfg.ctaText);
            ctaBtn.addEventListener('click', function (ev) {
                ev.stopPropagation();
                handleCtaNavigation(ev);
            });
            ctaWrap.appendChild(ctaBtn);
            frame.appendChild(ctaWrap);
            root.classList.add('gvw-has-cta');
        }

        root.appendChild(frame);
        doc.body.appendChild(root);

        var isExpanded = false;
        var timeInterval = null;
        var ctaTimeout = null;
        var focusReturnTarget = null;
        var playlistIndex = 0;

        var focusHandler = function (ev) {
            if (ev.type === 'keydown') handleKeyNavigation(ev);
        };
        root.addEventListener('keydown', focusHandler);

        function isVisible(el) {
            return !!(el && (el.offsetWidth || el.offsetHeight || el.getClientRects().length));
        }

        function handleKeyNavigation(ev) {
            var key = ev.key || ev.code;
            if (!isExpanded) {
                if ((key === 'Enter' || key === ' ' || key === 'Spacebar') && ev.target === root) {
                    ev.preventDefault();
                    expand();
                }
                return;
            }

            if (key === 'Tab') {
                trapFocus(ev);
                return;
            }
            if (key === 'Escape') {
                ev.preventDefault();
                collapse();
                return;
            }
            if (typeof key === 'string' && key.toLowerCase() === 'm') {
                ev.preventDefault();
                toggleSound();
                return;
            }
            if (typeof key === 'string' && key.toLowerCase() === 'c') {
                ev.preventDefault();
                collapse();
            }
        }

        function trapFocus(ev) {
            var focusables = Array.prototype.slice.call(root.querySelectorAll(FOCUSABLE_SELECTOR))
                .filter(function (el) {
                    return !el.disabled && isVisible(el);
                });
            if (!focusables.length) return;
            var first = focusables[0];
            var last = focusables[focusables.length - 1];

            if (ev.shiftKey) {
                if (doc.activeElement === first || !root.contains(doc.activeElement)) {
                    ev.preventDefault();
                    last.focus();
                }
            } else {
                if (doc.activeElement === last) {
                    ev.preventDefault();
                    first.focus();
                }
            }
        }

        function playSafe(unmute) {
            if (unmute) {
                video.muted = false;
                video.removeAttribute('muted');
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.catch(function () { });
            }
        }

        function expand() {
            if (isExpanded) return;
            isExpanded = true;
            focusReturnTarget = doc.activeElement;
            root.classList.add('gvw-expanded');
            root.setAttribute('aria-expanded', 'true');
            playSafe(true);
            updateSoundButton();
            startTimeLoop();
            scheduleCtaReveal();
            focusFirstInteractive();
            announceStatus();
        }

        function collapse() {
            if (!isExpanded) return;
            isExpanded = false;
            root.classList.remove('gvw-expanded');
            video.muted = true;
            video.setAttribute('muted', '');
            root.setAttribute('aria-expanded', 'false');
            updateSoundButton();
            stopTimeLoop();
            resetCta();
            announceStatus();
            if (focusReturnTarget && typeof focusReturnTarget.focus === 'function') {
                focusReturnTarget.focus();
            } else {
                root.focus();
            }
        }

        function focusFirstInteractive() {
            var focusables = Array.prototype.slice.call(root.querySelectorAll(FOCUSABLE_SELECTOR))
                .filter(function (el) { return !el.disabled && isVisible(el); });
            if (focusables.length) {
                focusables[0].focus();
            }
        }

        function hideWidget() {
            root.classList.add('gvw-hidden');
            stopTimeLoop();
            resetCta();
            video.pause();
        }

        function toggleSound() {
            if (!isExpanded) return;
            video.muted = !video.muted;
            if (!video.muted) {
                video.removeAttribute('muted');
                playSafe(true);
            } else {
                video.setAttribute('muted', '');
            }
            updateSoundButton();
            announceStatus();
        }

        function updateSoundButton() {
            if (video.muted) {
                soundBtn.classList.add('gvw-sound-muted');
                soundBtn.setAttribute('aria-label', 'Включить звук (клавиша M)');
                soundBtn.setAttribute('aria-pressed', 'false');
            } else {
                soundBtn.classList.remove('gvw-sound-muted');
                soundBtn.setAttribute('aria-label', 'Выключить звук (клавиша M)');
                soundBtn.setAttribute('aria-pressed', 'true');
            }
        }

        function scheduleCtaReveal() {
            if (!ctaWrap) return;
            clearTimeout(ctaTimeout);
            ctaTimeout = setTimeout(function () {
                if (isExpanded) {
                    root.classList.add('gvw-cta-ready');
                }
            }, ctaDelayMs);
        }

        function resetCta() {
            if (!ctaWrap) return;
            clearTimeout(ctaTimeout);
            ctaTimeout = null;
            root.classList.remove('gvw-cta-ready');
        }

        function startTimeLoop() {
            updateTime();
            if (timeInterval) return;
            timeInterval = setInterval(updateTime, 500);
        }

        function stopTimeLoop() {
            if (timeInterval) {
                clearInterval(timeInterval);
                timeInterval = null;
            }
        }

        function updateTime() {
            timeChip.textContent = formatTime(video.currentTime || 0);
        }

        frame.addEventListener('click', function () {
            if (isExpanded) return;
            expand();
        });

        function handleCtaNavigation(ev) {
            var href = cfg.ctaHref || '';
            if (!href) return;
            if (href.charAt(0) === '#') {
                ev.preventDefault();
                var target = doc.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                return;
            }
            if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) {
                return;
            }
            ev.preventDefault();
            win.location.assign(href);
        }

        function announceStatus() {
            if (!srStatus) return;
            var state = isExpanded ? 'развернут' : 'свернут';
            var sound = video.muted ? 'звук выключен' : 'звук включен';
            srStatus.textContent = 'Виджет ' + state + ', ' + sound + '. Видео ' + (playlistIndex + 1) + ' из ' + playlist.length + '.';
        }

        function updateMetaChip(meta) {
            if (!chip) return;
            var hasCaption = meta && meta.caption;
            var hasAvatar = meta && meta.avatar;
            if (!hasCaption && !hasAvatar) {
                chip.classList.remove('gvw-chip-visible');
                chipText.textContent = '';
                chipAvatar.classList.remove('gvw-chip-avatar-visible');
                chipAvatar.style.backgroundImage = '';
                return;
            }
            if (hasCaption) {
                chipText.textContent = meta.caption;
            } else {
                chipText.textContent = '';
            }
            if (hasAvatar) {
                chipAvatar.style.backgroundImage = 'url(' + meta.avatar + ')';
                chipAvatar.classList.add('gvw-chip-avatar-visible');
            } else {
                chipAvatar.style.backgroundImage = '';
                chipAvatar.classList.remove('gvw-chip-avatar-visible');
            }
            chip.classList.add('gvw-chip-visible');
        }

        function goToVideo(nextIndex, options) {
            if (!playlist.length) return;
            var opts = options || {};
            playlistIndex = (nextIndex + playlist.length) % playlist.length;
            var data = playlist[playlistIndex];
            if (!data || !data.src) return;

            video.pause();
            video.src = data.src;
            if (data.poster) {
                video.poster = data.poster;
            } else {
                video.removeAttribute('poster');
            }
            video.load();
            updateMetaChip(data);
            timeChip.textContent = '00:00';
            if (opts.autoplay !== false) {
                var handler = function () {
                    video.removeEventListener('canplay', handler);
                    playSafe(!!opts.unmute);
                };
                video.addEventListener('canplay', handler);
            }
            announceStatus();
        }

        function advancePlaylist() {
            if (playlist.length <= 1) {
                video.currentTime = 0;
                playSafe(!video.muted);
                return;
            }
            var shouldUnmute = !video.muted;
            goToVideo(playlistIndex + 1, { autoplay: true, unmute: shouldUnmute });
        }

        video.addEventListener('loadedmetadata', updateTime);
        video.addEventListener('timeupdate', function () {
            if (isExpanded) updateTime();
        });
        video.addEventListener('ended', function () {
            advancePlaylist();
        });

        goToVideo(0, { autoplay: true, unmute: false });
    }

    ready(function () {
        var playlist = buildPlaylist();
        if (!playlist.length) return;
        createStyles();
        initWidget(playlist);
    });

})(document, window);
