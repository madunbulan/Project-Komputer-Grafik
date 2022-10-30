// deklarasi palet warna yang digunakan untuk objek dalam game
var Colors = {
    cherry: 0xe35d6a,
    blue: 0x1560bd,
    white: 0xd8d0d1,
    black: 0x000000,
    brown: 0x59332e,
    peach: 0xffdab9,
    yellow: 0xffff00,
    olive: 0x556b2f,
    grey: 0x696969,
    sand: 0xc2b280,
    brownDark: 0x23190f,
    green: 0x669900,
    ground: 0x2a2a2a,
    sidewalk: 0x707070,
    grass: 0x155426,
    roadLine: 0xf5c242,
    whiteman: 0xc68642,
    luffy: 0xa90000,
};

var deg2Rad = Math.PI / 180;

// Membuat world baru ketika halaman dimuat.
window.addEventListener('load', function() {
    new World();
});




//sebuah class yang memiliki instance bernama "world" dimana skenario game dan loop game (update animasi, dll) diinisialisasikan.
function World() {

    // Explicit binding
    var self = this;

    // mendeklarasikan variabel yang akan digunakan dalam instance world ini.
    var element, scene, camera, character, renderer, light, keysAllowed, fogDistance;

    // menggunakan library howler.js untuk memasukkan audio ke dalam game
    // deklarasi audio yang akan digunakan
    var music = {
        overworld: new Howl({
            src: [
                "audio/howler-demo-bg-music.mp3"
            ],
            // autoplay: true,
            loop: true
        })
    }


    // inisialisasi world.
    init();

    /**
     * membuat renderer, scene, lights, camera, dan karakter untuk game,
     * kemudian melakukan looping terhadap renderer.
     */
    function init() {

        // mencari dimana envinroment game (world) akan ditempatkan.
        element = document.getElementById('world');
        // memainkan background musik
        music.overworld.play()

        // inisialisasi renderer.
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(element.clientWidth, element.clientHeight);
        renderer.shadowMap.enabled = true;
        element.appendChild(renderer.domElement);

        //inisialisasi scene.
        scene = new THREE.Scene();
        fogDistance = 40000;
        scene.fog = new THREE.Fog(0xf0fff0, 1, fogDistance);


        // inisialisasi camera dengan fov, aspect ratio, near plane dan far plane.
        // game ini menggunakan camera dengan tipe persepective camera.
        camera = new THREE.PerspectiveCamera(
            60, element.clientWidth / element.clientHeight, 1, 120000);
        camera.position.set(0, 1500, -2000);
        camera.lookAt(new THREE.Vector3(0, 600, -5000));
        window.camera = camera;

        //membuat game responsive (dapat menyesuaikan layar), dengan memanggil fungsi handleWindowResize.
        window.addEventListener('resize', handleWindowResize, false);

        //inisialisasi lighting (pencahayaan) yang digunakan dalam game.
        light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        scene.add(light);

        //inisialisasi karakter yang digunakan dalam game dan memasukkannya ke dalam scene.
        character = new Character();
        scene.add(character.element);

        // membuat jalanan, garis jalanan, dan pinggir jalanan menggunakan fungsi createbox (berfungsi untuk membuat mesh berbentuk box).
        var ground = createBox(3000, 20, 120000, Colors.ground, 0, -400, -60000);
        var ground2 = createBox(3500, 10, 120000, Colors.sidewalk, 0, -400, -60000);
        var ground3 = createBox(50000, 5, 120000, Colors.green, 0, -400, -60000);
        var line1 = createBox(40, 20, 120000, Colors.roadLine, 50, -400, -60000);
        var line2 = createBox(40, 20, 120000, Colors.roadLine, -50, -400, -60000);
        scene.add(ground);
        scene.add(ground2);
        scene.add(ground3);
        scene.add(line1);
        scene.add(line2);





        //keycode
        var left = 37;
        var up = 38;
        var right = 39;
        var p = 80;


        //sfx jump menggunakan howler.js
        var sfx = {
            jump: new Howl({
                src: [
                    'Audio/jump sound.mp3',
                ]
            }),
        }

        //menerima input keyboard user untuk menggerakan karakter (atas, kiri, kanan)
        keysAllowed = {};
        document.addEventListener(
            'keydown',
            function(e) {
                var key = e.keyCode;
                if (key == up) {
                    character.onUpKeyPressed();
                    sfx.jump.play();
                }
                if (key == left) {
                    character.onLeftKeyPressed();
                }
                if (key == right) {
                    character.onRightKeyPressed();
                }
            }
        );
        document.addEventListener(
            'keyup',
            function(e) {
                keysAllowed[e.keyCode] = true;
            }
        );
        document.addEventListener(
            'focus',
            function(e) {
                keysAllowed = {};
            }
        );

        //memulai loop rendering.
        loop();

    }

    /**
     * Loop animasi utama.
     */
    function loop() {
        // membuat karakter bergerak sesuai dengan input kontrol user.
        character.update();
        // Render the page and repeat.
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
    }

    /**
     * fungsi yang membuat game menjadi responsive.
     */
    function handleWindowResize() {
        renderer.setSize(element.clientWidth, element.clientHeight);
        camera.aspect = element.clientWidth / element.clientHeight;
        camera.updateProjectionMatrix();
    }
}


/**
 * Karakter yang digunakan dalam game.
 * Sumber template karakter: https://codepen.io/dalhundal/pen/pJdLjL
 */
function Character() {

    // Explicit binding
    var self = this;

    //Settingan karakter (seperti warna kulit, baju, durasi lompat, dll)
    this.skinColor = Colors.whiteman;
    this.hairColor = Colors.black;
    this.shirtColor = Colors.luffy;
    this.shortsColor = Colors.black;
    this.jumpDuration = 0.6;
    this.jumpHeight = 2000;

    // inisiasliasi karakter
    init();

    function init() {

        // membangun bentuk karakter.
        self.face = createBox(100, 100, 60, self.skinColor, 0, 0, 0);
        self.hair = createBox(105, 20, 65, self.hairColor, 0, 50, 0);
        self.head = createGroup(0, 260, -25);
        self.head.add(self.face);
        self.head.add(self.hair);

        self.torso = createBox(150, 190, 40, self.shirtColor, 0, 100, 0);

        self.leftLowerArm = createLimb(20, 120, 30, self.skinColor, 0, -170, 0);
        self.leftArm = createLimb(30, 140, 40, self.skinColor, -100, 190, -10);
        self.leftArm.add(self.leftLowerArm);

        self.rightLowerArm = createLimb(
            20, 120, 30, self.skinColor, 0, -170, 0);
        self.rightArm = createLimb(30, 140, 40, self.skinColor, 100, 190, -10);
        self.rightArm.add(self.rightLowerArm);

        self.leftLowerLeg = createLimb(40, 200, 40, self.skinColor, 0, -200, 0);
        self.leftLeg = createLimb(50, 170, 50, self.shortsColor, -50, -10, 30);
        self.leftLeg.add(self.leftLowerLeg);

        self.rightLowerLeg = createLimb(40, 200, 40, self.skinColor, 0, -200, 0);
        self.rightLeg = createLimb(50, 170, 50, self.shortsColor, 50, -10, 30);
        self.rightLeg.add(self.rightLowerLeg);

        self.element = createGroup(0, 0, -4000);
        self.element.add(self.head);
        self.element.add(self.torso);
        self.element.add(self.leftArm);
        self.element.add(self.rightArm);
        self.element.add(self.leftLeg);
        self.element.add(self.rightLeg);

        // inisialisasi perubahan parameter karakter (kalo loncat, gerak, pindah kiri kanan, dll)
        self.isJumping = false;
        self.isSwitchingLeft = false;
        self.isSwitchingRight = false;
        self.currentLane = 0;
        self.runningStartTime = new Date() / 1000;
        self.stepFreq = 2;
        self.queuedActions = [];

    }

    /**
     * Membuat dan mengembalikan sebuah lengan dengan rotasi axis di atas.
     *
     * @param {number} DX Lebar lengan.
     * @param {number} DY Panjang lengan.
     * @param {number} DZ Kedalaman lengan.
     * @param {color} COLOR Warna lengan.
     * @param {number} X Koordinat X pada tengah rotasi.
     * @param {number} Y Koordinat Y pada tengah rotasi.
     * @param {number} Z Koordinat Z pada tengah rotasi.
     * @return {THREE.GROUP} Grup yang meliputi sebuah kotak yang berisikan anggota tubuh
     *                       dengan atribut yang sudah ditentukan.
     *
     */
    function createLimb(dx, dy, dz, color, x, y, z) {
        var limb = createGroup(x, y, z);
        var offset = -1 * (Math.max(dx, dz) / 2 + dy / 2);
        var limbBox = createBox(dx, dy, dz, color, 0, offset, 0);
        limb.add(limbBox);
        return limb;
    }

    /**
     * Sebuah method dipanggil pada karakter ketika waktu bergerak maju.
     */
    this.update = function() {

        // Mendapatkan waktu sekarang untuk perhitungan kedepannya.
        var currentTime = new Date() / 1000;

        // Menerapkan aksi pada karakter jika sedang tidak melakukan sesuatu.
        if (!self.isJumping &&
            !self.isSwitchingLeft &&
            !self.isSwitchingRight &&
            self.queuedActions.length > 0) {
            switch (self.queuedActions.shift()) {
                case "up":
                    self.isJumping = true;
                    self.jumpStartTime = new Date() / 1000;
                    break;
                case "left":
                    if (self.currentLane != -1) {
                        self.isSwitchingLeft = true;
                    }
                    break;
                case "right":
                    if (self.currentLane != 1) {
                        self.isSwitchingRight = true;
                    }
                    break;
            }
        }

        // Jika karakter melompat, mengupdate tinggi dari karakter.
        // Jika tidak, karakter akan lanjur berlari.
        if (self.isJumping) {
            var jumpClock = currentTime - self.jumpStartTime;
            self.element.position.y = self.jumpHeight * Math.sin(
                    (1 / self.jumpDuration) * Math.PI * jumpClock) +
                sinusoid(2 * self.stepFreq, 0, 20, 0,
                    self.jumpStartTime - self.runningStartTime);
            if (jumpClock > self.jumpDuration) {
                self.isJumping = false;
                self.runningStartTime += self.jumpDuration;
            }
        } else {
            var runningClock = currentTime - self.runningStartTime;
            self.element.position.y = sinusoid(
                2 * self.stepFreq, 0, 20, 0, runningClock);
            self.head.rotation.x = sinusoid(
                2 * self.stepFreq, -10, -5, 0, runningClock) * deg2Rad;
            self.torso.rotation.x = sinusoid(
                2 * self.stepFreq, -10, -5, 180, runningClock) * deg2Rad;
            self.leftArm.rotation.x = sinusoid(
                self.stepFreq, -70, 50, 180, runningClock) * deg2Rad;
            self.rightArm.rotation.x = sinusoid(
                self.stepFreq, -70, 50, 0, runningClock) * deg2Rad;
            self.leftLowerArm.rotation.x = sinusoid(
                self.stepFreq, 70, 140, 180, runningClock) * deg2Rad;
            self.rightLowerArm.rotation.x = sinusoid(
                self.stepFreq, 70, 140, 0, runningClock) * deg2Rad;
            self.leftLeg.rotation.x = sinusoid(
                self.stepFreq, -20, 80, 0, runningClock) * deg2Rad;
            self.rightLeg.rotation.x = sinusoid(
                self.stepFreq, -20, 80, 180, runningClock) * deg2Rad;
            self.leftLowerLeg.rotation.x = sinusoid(
                self.stepFreq, -130, 5, 240, runningClock) * deg2Rad;
            self.rightLowerLeg.rotation.x = sinusoid(
                self.stepFreq, -130, 5, 60, runningClock) * deg2Rad;

            // Jika karakter tidak melompat, karakter bisa pindah jalur.
            if (self.isSwitchingLeft) {
                self.element.position.x -= 200;
                var offset = self.currentLane * 800 - self.element.position.x;
                if (offset > 800) {
                    self.currentLane -= 1;
                    self.element.position.x = self.currentLane * 800;
                    self.isSwitchingLeft = false;
                }
            }
            if (self.isSwitchingRight) {
                self.element.position.x += 200;
                var offset = self.element.position.x - self.currentLane * 800;
                if (offset > 800) {
                    self.currentLane += 1;
                    self.element.position.x = self.currentLane * 800;
                    self.isSwitchingRight = false;
                }
            }
        }
    }

    /**
     * Mengatur karakter ketika tombol kiri diklik.
     */
    this.onLeftKeyPressed = function() {
        self.queuedActions.push("left");
    }

    /**
     * Mengatur karakter ketika tumbol atas diklik.
     */
    this.onUpKeyPressed = function() {
        self.queuedActions.push("up");
    }

    /**
     * Mengatur karakter ketika tumbol kanan diklik.
     */
    this.onRightKeyPressed = function() {
        self.queuedActions.push("right");
    }

    /**
     * Mengatur karakter ketika game sedang dipause.
     */

}

/**
 * Fungsi utilitas untuk menghasilkan nilai arus variabel yang bervariasi secara sinusoidal.
 *
 * @param {number} FREQUENCY Jumlah getaran per detik.
 * @param {number} MINIMUM Nilai minimum dari sinus.
 * @param {number} MAXIMUM Nilai maksimum dari sinus.
 * @param {number} PHASE Fase offset dari derajat.
 * @return {number} Offset sinus pada saat ini.
 *
 */
function sinusoid(frequency, minimum, maximum, phase, time) {
    var amplitude = 0.5 * (maximum - minimum);
    var angularFrequency = 2 * Math.PI * frequency;
    var phaseRadians = phase * Math.PI / 180;
    var offset = amplitude * Math.sin(
        angularFrequency * time + phaseRadians);
    var average = (minimum + maximum) / 2;
    return average + offset;
}

/**
 * Membuat sebuah grup kosong pada lokasi yang sudah ditentukan. 
 *
 * @param {number} X Koordinat X pada sebuah grup.
 * @param {number} Y Koordinat Y pada sebuah grup.
 * @param {number} Z Koordinat Z pada sebuah grup.
 * @return {Three.Group} Grup kosong pada lokasi yang sudah ditentukan.
 *
 */
function createGroup(x, y, z) {
    var group = new THREE.Group();
    group.position.set(x, y, z);
    return group;
}

/**
 * Membuat dan mengembalikan sebuah silinder dengan atribut yang sudah ditentukan.
 *
 * @param {number} RADIUSTOP Radius silinder diatas.
 * @param {number} RADIUSBOTTOM Radius silinder dibawah.
 * @param {number} HEIGHT Lebar silinder.
 * @param {number} RADIALSEGMENTS Jumlah wajah tersegmentasi di sekitar keliling silinder.                             
 * @param {color} COLOR Warna silinder.
 * @param {number} X Koordinat X pada tengah silinder.
 * @param {number} Y Koordinat Y pada tengah silinder.
 * @param {number} Z Koordinat Z pada tengah silinder.
 * @return {THREE.Mesh} Sebuah kotak dengan atribut yang sudah ditentukan.
 */
function createCylinder(radiusTop, radiusBottom, height, radialSegments,
    color, x, y, z) {
    var geom = new THREE.CylinderGeometry(
        radiusTop, radiusBottom, height, radialSegments);
    var mat = new THREE.MeshPhongMaterial({
        color: color,
        flatShading: true
    });
    var cylinder = new THREE.Mesh(geom, mat);
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    cylinder.position.set(x, y, z);
    return cylinder;

}