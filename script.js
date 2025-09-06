let currentaudio = new Audio();
let songs;
let currFolder;
let coverimg;
let initialFolder;
let folders = [];

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(1, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

const footerImg = [
    "assets/music-footer.jpg",
    "assets/music-footer-2.jpg",
    "assets/music-footer-3.jpg",
    "assets/music-footer-4.jpg",
    "assets/music-footer-5.webp",
    "assets/music-footer-6.webp",
    "assets/music-footer-9.jpg",
    "assets/music-footer-10.jpg",
];

function randomImg() {
    const randomIndex = Math.floor(Math.random() * footerImg.length);
    return footerImg[randomIndex];
}

const playsong = (track, pause = false) => {
    currentaudio.src = `${currFolder}/` + track + ".mp3";

    if (!pause) {
        currentaudio.play();
        play.src = "assets/play.svg";
    }

    document.querySelector(".songdetail").innerHTML = `
        <img src="${randomImg()}" alt="cover" width="45px">
        <a>${track}</a>`;
}

// ------------------------- Fetch songs in a folder -------------------------
async function getSongs(folder) {
    currFolder = folder;

    let a = await fetch(`./songs/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(
                decodeURIComponent(element.href.split(`${folder}`)[1]).replace(".mp3", "").replace("/", "")
            );
        }
    }

    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";

    for (const song of songs) {
        songul.innerHTML += `
        <li data-song="${song}">
            <img class="libimg" src="${coverimg}" alt="cover" width="45px">
            <span>${song}</span>
            <img id="libplay" src="assets/library_play.svg" alt="">
        </li>`;
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playsong(e.dataset.song);
        })
    })
}

// ------------------------- Fetch all album folders -------------------------
async function getAlbums() {
    let a = await fetch(`./songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a");

    folders = [];
    Array.from(anchor).forEach(e => {
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            folders.push(folder);
        }
    });

    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = (e.href.split("/").slice(-2)[0]);
            // getting the title and description of perticular albums
            let a = await fetch(`./songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            let cards = document.querySelector(".cards");
            cards.innerHTML += `
                    <div data-folder="${folder}" class="card flex">
                        <img src="songs/${folder}/cover.jpeg" alt="card">
                        <a href="#">${response.title}</a>
                        <p>${response.artist}</p>
                    </div>`;
            coverimg = `songs/${folder}/cover.jpeg`;
        }
    }

    // add card click feature
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = `songs/${item.currentTarget.dataset.folder}`;
            coverimg = `${folder}/cover.jpeg`;
            await getSongs(folder);
            playlist.src = "assets/playlist.svg";
            if (window.innerWidth < 768) {
                sidebar.style.width = "99%";
                content.style.display = "none";
            }
            else {
                sidebar.style.width = "21vw";
                library.style.padding = "20px 20px 14px 30px";
            }
        })
    });

}

async function main() {
    // list all albums
    await getAlbums();

    // set currFolder
    initialFolder = folders[0];
    const initialPath = `songs/${initialFolder}`;
    coverimg = `${initialPath}/cover.jpeg`;

    // list all songs from the first album
    await getSongs(`songs/${initialFolder}`);
    playsong(songs[0], true);

    play.addEventListener("click", () => {
        if (currentaudio.paused) {
            currentaudio.play();
            play.src = "assets/play.svg";
        }
        else {
            currentaudio.pause();
            play.src = "assets/pause.svg";
        }
        if (play.src.includes("play.svg")) {
            if (window.innerWidth < 768) {
                footer.classList.toggle("footer-expanded");
            }
        }
    })

    // add mute/ unmute
    volume.addEventListener("click", () => {
        if (currentaudio.muted) {
            currentaudio.muted = false;
            volume.src = "assets/volume.svg"
        }
        else {
            currentaudio.muted = true;
            volume.src = "assets/mute.svg";
        }
    })

    // add time bar
    currentaudio.addEventListener("timeupdate", () => {
        let curr = document.getElementById("currtime");
        let total = document.getElementById("totaltime");

        curr.innerHTML = secondsToMinutesSeconds(currentaudio.currentTime);
        total.innerHTML = secondsToMinutesSeconds(currentaudio.duration);

        timebar.max = currentaudio.duration;
        timebar.value = currentaudio.currentTime;
    })

    timebar.addEventListener("input", (e) => {
        currentaudio.currentTime = e.target.value;
    })

    // add volume bar
    let volumebar = document.getElementById("volumebar");
    currentaudio.volume = volumebar.value / 100;

    volumebar.addEventListener("input", (e) => {
        currentaudio.volume = e.target.value / 100;
    })


    // add reload/ refresh feature
    homebtn.addEventListener("click", () => {
        playlist.src = "assets/playlist-close.svg";
        if (window.innerWidth < 768) {
            sidebar.style.width = "0";
            content.style.display = "flex";
        }
        else {
            sidebar.style.width = "6vw";
        }
    })
    logobtn.addEventListener("click", () => {
        location.reload();
    })

    library.addEventListener("click", () => {
        if (playlist.src.includes("playlist.svg")) {
            playlist.src = "assets/playlist-close.svg";
            if (window.innerWidth < 768) {
                sidebar.style.width = "0";
                content.style.display = "flex";
            }
            else {
                sidebar.style.width = "6vw";
            }
        }
        else {
            playlist.src = "assets/playlist.svg";
            if (window.innerWidth < 768) {
                sidebar.style.width = "99%";
                content.style.display = "none";
            }
            else {
                sidebar.style.width = "21vw";
                library.style.padding = "20px 20px 14px 30px";
            }
        }
    })

    function setSidebarState() {
        const sidebar = document.getElementById("sidebar");
        const playlistIcon = document.getElementById("playlist");

        if (window.innerWidth <= 768) {
            // Mobile
            sidebar.style.width = "0";
            playlistIcon.src = "assets/playlist-close.svg";
        } else {
            // Laptop/Desktop
            sidebar.style.width = "21vw";
            playlistIcon.src = "assets/playlist.svg";
        }
    }

    // Run on load
    window.addEventListener("load", setSidebarState);
    // Run on resize
    window.addEventListener("resize", setSidebarState);

    // all footer codes--- like on click footer expand by some height
    songinfo.addEventListener("click", () => {
        if (window.innerWidth < 768) {
            footer.classList.toggle("footer-expanded");
        }
    });
    closebtn.addEventListener("click", () => {
        if (window.innerWidth < 768) {
            footer.classList.toggle("footer-expanded");
        }
    });

    // add previous and next btn listener
    previous.addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentaudio.src.split("/").pop().replace(".mp3", ""));
        let index = songs.indexOf(currentTrack);

        if (index > 0) {
            playsong(songs[index - 1]);
        }
    })

    next.addEventListener("click", () => {
        let currentTrack = decodeURIComponent(currentaudio.src.split("/").pop().replace(".mp3", ""));
        let index = songs.indexOf(currentTrack);

        if (index < songs.length - 1) {
            playsong(songs[index + 1]);
        }
    })

    // adding some important features like enterkey and mutekey
    document.addEventListener('keydown', (e) => {

        if (e.key === " ") {
            if (currentaudio.paused) {
                currentaudio.play();
                play.src = "assets/play.svg";
            }
            else {
                currentaudio.pause();
                play.src = "assets/pause.svg";
            }
        }

        if (e.key === "M" || e.key === "m") {
            if (currentaudio.muted) {
                currentaudio.muted = false;
                volume.src = "assets/volume.svg"
            }
            else {
                currentaudio.muted = true;
                volume.src = "assets/mute.svg";
            }
        }

        if (e.key === "N" || e.key === "n") {
            let currentTrack = decodeURIComponent(currentaudio.src.split("/").pop().replace(".mp3", ""));
            let index = songs.indexOf(currentTrack);

            if (index < songs.length - 1) {
                playsong(songs[index + 1]);
            }
        }

        if (e.key === "P" || e.key === "p") {
            let currentTrack = decodeURIComponent(currentaudio.src.split("/").pop().replace(".mp3", ""));
            let index = songs.indexOf(currentTrack);

            if (index > 0) {
                playsong(songs[index - 1]);
            }
        }

        if (e.key === "ArrowUp") {
            volumebar.value = Math.min(100, parseInt(volumebar.value) + 5);
            currentaudio.volume = volumebar.value / 100;
        }

        if (e.key === "ArrowDown") {
            volumebar.value = Math.min(100, parseInt(volumebar.value) - 5);
            currentaudio.volume = volumebar.value / 100;
        }


    })

    //-------------------------------------------------some good codes LOL----------
    // Disable right-click
    document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });

    // Disable common inspect element & view source shortcuts
    document.addEventListener("keydown", (e) => {
        // F12
        if (e.key === "F12") {
            e.preventDefault();
        }

        // Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+Shift+C
        if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) {
            e.preventDefault();
        }

        // Ctrl+U (view source)
        if (e.ctrlKey && e.key === "u") {
            e.preventDefault();
        }

        // Ctrl+S (save page)
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
        }
    });

    // Block double-click (so nothing happens when user double-clicks)
    document.addEventListener("dblclick", (e) => {
        e.preventDefault();
    });

    // Block text selection
    document.addEventListener("selectstart", (e) => {
        e.preventDefault();
    });

    // Block copy
    document.addEventListener("copy", (e) => {
        e.preventDefault();
    });
}

main();
