/**
 * Creates a video container element with the provided video URL.
 * @param {string} videoUrl - The video URL.
 * @return {HTMLDivElement} - The video container element.
 */
function createVideoContainer(videoUrl: string, channelName: string) {
    const VIDEO_ASPECT_RATIO = 56.25; // 16:9 aspect ratio

    const container = document.createElement('div');
    container.classList.add('video-container');
    container.style.position = 'relative';
    container.style.paddingBottom = `${VIDEO_ASPECT_RATIO}%`;

    const controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'space-between';
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.width = '100%';
    controlsContainer.style.padding = '10px';
    controlsContainer.style.boxSizing = 'border-box';
    controlsContainer.style.color = '#fff';
    container.appendChild(controlsContainer);

    const prevButton = document.createElement('button');
    prevButton.textContent = '<<';
    prevButton.classList.add('prev-video');
    controlsContainer.appendChild(prevButton);

    const channelElement = document.createElement('div');
    channelElement.textContent = channelName;
    channelElement.style.textAlign = 'center';
    controlsContainer.appendChild(channelElement);

    const nextButton = document.createElement('button');
    nextButton.textContent = '>>';
    nextButton.classList.add('next-video');
    controlsContainer.appendChild(nextButton);

    const iframe = document.createElement('iframe');
    iframe.classList.add('youtube-video');
    iframe.src = videoUrl;
    iframe.style.position = 'absolute';
    iframe.style.top = '50px'; // Adjust this value based on the height of your controlsContainer
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.allowFullscreen = true;
    container.appendChild(iframe);

    container.iframe = iframe;
    container.channelElement = channelElement;

    return container;
}

interface LeetCodeProblem {
    title: string;
    videos: {
        embedded_url: string;
        channel: string;
    }[];
    // add more properties as needed
}

/**
 * Injects the embedded YouTube solution into the solutions tab of the LeetCode problem.
 * @param {string} title - The problem title.
 */
function addVideo(title: string): void {
    const SOLUTIONS_TAB_INDEX = 1;

    const solutionsTab = document.querySelectorAll<HTMLDivElement>('div.w-full.flex-col.overflow-auto')[SOLUTIONS_TAB_INDEX];
    if (!solutionsTab) return;

    const existingContainer = solutionsTab.parentElement?.querySelector<HTMLDivElement>('div.video-container');
    if (existingContainer) return;

    chrome.storage.local.get(['leetcodeProblems'], (result) => {
        const problems = result.leetcodeProblems.questions;
        const problem = problems.find((problem: LeetCodeProblem) => problem.title === title);

        if (problem && problem.videos && problem.videos.length > 0) {
            let currentVideoIndex = 0;
            const container = createVideoContainer(problem.videos[currentVideoIndex].embedded_url, problem.videos[currentVideoIndex].channel);
            solutionsTab.parentElement?.insertBefore(container, solutionsTab);

            const prevButton = container.querySelector('button.prev-video');
            const nextButton = container.querySelector('button.next-video');

            prevButton?.addEventListener('click', () => {
                currentVideoIndex = (currentVideoIndex - 1 + problem.videos.length) % problem.videos.length;
                updateVideo(container, problem.videos[currentVideoIndex].embedded_url, problem.videos[currentVideoIndex].channel);
            });

            nextButton?.addEventListener('click', () => {
                currentVideoIndex = (currentVideoIndex + 1) % problem.videos.length;
                updateVideo(container, problem.videos[currentVideoIndex].embedded_url, problem.videos[currentVideoIndex].channel);
            });
        }
    });
}

function updateVideo(container: HTMLDivElement, videoUrl: string, channelName: string): void {
    container.iframe.src = videoUrl;
    container.channelElement.textContent = channelName;
}

/**
 * Handles incoming messages from the background script.
 */
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'addVideo') {
        const title = request.title.split('-')[0].trim();
        addVideo(title);
    }
});

/**
 * This code is used to prevent the iframe from freezing when its being resized while the mouse is hovering over it
 */
window.addEventListener('mousedown', () => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.youtube-video');
    if (iframe) {
        iframe.style.pointerEvents = 'none';
    }
});

window.addEventListener('mouseup', () => {
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.youtube-video');
    if (iframe) {
        iframe.style.pointerEvents = 'auto';
    }
});
