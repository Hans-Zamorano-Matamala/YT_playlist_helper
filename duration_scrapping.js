let mutationObserver = null;

function showHelperUI() {
    const strings = getLocalizedStrings();
    const document_body = document.getElementsByTagName('body')[0];
    const wrapper_css = {
        "position": "fixed",
        "top": "80px",
        "right": "20px",
        "background": "white",
        "display": "block",
        "padding": "10px",
        "border-radius": "3px"
    }

    const wrapper = document.createElement('div');

    wrapper.id = 'hmzm_YT_PL_Helper';

    for (style in wrapper_css) {
        wrapper.style[style] = wrapper_css[style];
    }

    wrapper.innerHTML = `
        <span id="hmzm_YT_PL_Helper_videos_amount_label">${strings.videos_amount}: </span><span id="hmzm_YT_PL_Helper_videos_amount">0</span>
        <br/>
        <span id="hmzm_YT_PL_Helper_total_duration_label">${strings.total_duration}: </span><span id="hmzm_YT_PL_Helper_total_duration">0:00</span>
    `;

    document_body.appendChild(wrapper);

    updateUI();

    bindMutationObserver();
}

// TODO: This doesn't work :C
function bindMutationObserver() {
    const observedNode = document.querySelector('ytd-playlist-video-list-renderer');

    if (mutationObserver === null) {

        if (typeof (MutationObserver) === 'function') {
            mutationObserver = new MutationObserver(mutationHandler)

            // Configura el observer:
            const config = { attributes: true, childList: true, characterData: true };

            // pasa al observer el nodo y la configuracion
            mutationObserver.observe(observedNode, config);
        }
    }
}

function mutationHandler() {
    debugger
    console.log('got mutations');
    updateUI();
}

function getLocalizedStrings(selected_localization = 'en-EN') {
    localizations = {
        'en-EN': {
            videos_amount: 'Videos count',
            total_duration: 'Total duration'
        }
    }

    const default_localization = 'en-EN';

    let result = localizations[default_localization];

    if (localizations[selected_localization]) {
        result = localizations[selected_localization];
    } else {
        console.error('[hmzm_YT_PL_Helper] Unknown localization. Showing default one');
    }

    return result;
}

function updateUI() {
    const data = getTotalPlayListDuration();

    const amount_span = document.querySelector('#hmzm_YT_PL_Helper_videos_amount');
    const duration_span = document.querySelector('#hmzm_YT_PL_Helper_total_duration');

    if (amount_span && duration_span) {
        amount_span.innerText = data.videos_amount;
        duration_span.innerText = data.total_duration;
    } else {
        throw new Error('[hmzm_YT_PL_Helper] Missing UI');
    }
}

//* Note Playlist items page loads by a maximun of 100 videos, then requries user scroll.
function getTotalPlayListDuration() {
    const durations_raw = document.querySelectorAll('[page-subtype="playlist"] ytd-thumbnail-overlay-time-status-renderer #text');

    const durations_raw_arr = Array.from(durations_raw);
    const videos_amount = durations_raw_arr.length;

    console.log(`Got ${videos_amount} videos.`);

    const total_WL_duration_secs = durations_raw_arr.reduce((acc, curr) => {
        const components = curr.textContent.trim().split(':');

        let hours = 0, minutes = 0, remaining_seconds = 0;

        if (components.length === 3) {
            [hours, minutes, remaining_seconds] = components;
        } else if (components.length === 2) {
            [minutes, remaining_seconds] = components;
        } else {
            throw new Error(`Unknown time format!: ${curr}`);
        }

        const duration = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(remaining_seconds);

        return acc += duration;
    }, 0)

    const total_duration_int = getTotalDurationComponents(total_WL_duration_secs);
    const formatted_duration = getFormattedDuration(total_duration_int);

    return {
        videos_amount: videos_amount,
        total_duration: `${formatted_duration.hours}:${formatted_duration.minutes}:${formatted_duration.seconds}`
    }
}

function getTotalDurationComponents(total_seconds) {
    const total_WL_duration_hours = parseInt(total_seconds / 3600);
    const total_WL_duration_total_remaining_seconds = total_seconds - (total_WL_duration_hours * 3600);
    const total_WL_duration_remaining_minutes = parseInt(total_WL_duration_total_remaining_seconds / 60);
    const total_WL_duration_remaining_seconds = total_WL_duration_total_remaining_seconds - (total_WL_duration_remaining_minutes * 60);

    return {
        hours: total_WL_duration_hours,
        minutes: total_WL_duration_remaining_minutes,
        seconds: total_WL_duration_remaining_seconds
    }
}

function getFormattedDuration(total_duration_int) {
    const formatted_hours = String(total_duration_int.hours);
    const formatted_minutes = ("00" + String(total_duration_int.minutes)).slice(-2);
    const formatted_seconds = ("00" + String(total_duration_int.seconds)).slice(-2);

    return {
        hours: formatted_hours,
        minutes: formatted_minutes,
        seconds: formatted_seconds
    }
}