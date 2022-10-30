/**
 * Boilerplate untuk karakter, latar, kamera, renderer, cahaya diambil dari
 * https://codepen.io/dalhundal/pen/pJdLjL
 *
 */

/**
 * Konstan yang dipakai dalam game.
 */
var Colors = {
    cherry: 0xe35d6a,
    blue: 0x1560bd,
    white: 0xd8d0d1,
    black: 0x000000,
    brown: 0x59332e,
    peach: 0xffdab9,
    yellow: 0xffff00,
    olive: 0x556b2f,
    whiteman: 0xc68642,
    luffy: 0xa90000,
};

var deg2Rad = Math.PI / 180;

// Membuat sebuah world ketika page dijalankan.
window.addEventListener('load', function() {
    new World(document.getElementById('world'));
});

/**
 * Fungsi utilitas untuk menghasilkan nilai arus variabel yang bervariasi secara sinusoidal.
 * Semua sinusoida dengan frekuensi yang sama disinkronkan secara global, 
 * sehingga fase argumen sepenuhnya menentukan fase relatif.
 *
 * @param {number} FREQUENCY Jumlah getaran per detik.
 * @param {number} MINIMUM Nilai minimum dari sinus.
 * @param {number} MAXIMUM Nilai maksimum dari sinus.
 * @param {number} PHASE Fase offset dari derajat.
 * @return {number} Offset sinus pada saat ini.
 *
 */
function sinusoid(frequency, minimum, maximum, phase) {
    var amplitude = 0.5 * (maximum - minimum);
    var angularFrequency = 2 * Math.PI * frequency;
    var phaseRadians = phase * Math.PI / 180;
    var currTimeInSecs = new Date() / 1000;
    var offset = amplitude * Math.sin(
        angularFrequency * currTimeInSecs + phaseRadians);
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
 * Membuat dan mengembalikan sebuah kotak dengan atribut yang sudah ditentukan.
 *
 * @param {number} DX Lebar kotak.
 * @param {number} DY Tinggi kotak.
 * @param {number} DZ Kedalaman kotak.
 * @param {color} COLOR Warna kotak.
 * @param {number} X Koordinat X pada bagian tengah kotak.
 * @param {number} Y Koordinat Y pada bagian tengah kotak.
 * @param {number} Z Koordinat Z pada bagian tengah kotak.
 * @param {boolean} NOTFLATSHADING Benar jika flatShading salah.
 * @return {THREE.Mesh} Sebuah kotak dengan atribut yang sudah ditentukan.
 *
 */
function createBox(dx, dy, dz, color, x, y, z, notFlatShading) {
    var geom = new THREE.BoxGeometry(dx, dy, dz);
    var mat = new THREE.MeshPhongMaterial({
        color: color,
        flatShading: notFlatShading != true
    });
    var box = new THREE.Mesh(geom, mat);
    box.castShadow = true;
    box.receiveShadow = false;
    box.position.set(x, y, z);
    return box;
}

/**
 * Karakter player dalam game.
 */
function Character() {

    // Explicit binding.
    var self = this;

    // Karakter bawaan (default).
    this.skinColor = Colors.whiteman;
    this.hairColor = Colors.black;
    this.shirtColor = Colors.luffy;
    this.shortsColor = Colors.black;
    this.stepFreq = 2;

    // Inisialisasi karakter.
    init();

    /**
     * The parts of are Membangun karakter secara mendalam-langkah pertama.
     * Dimodelkan berdasarkan objek berikut :
     *
     * - Karakter (this.element)
     *    - Kepala
     *       - Wajah
     *       - Rambut
     *    - Tubuh
     *    - Tangan kiri
     *       - Lengan kiri bawah
     *    - Tangan kanan
     *       - Lengan kanan bawah
     *    - Kaki kiri
     *       - Kaki kiri bawah
     *    - Kaki kanan
     *       - Kaki kanan bawah
     * 
     */
    function init() {

        self.face = createBox(100, 100, 60, self.skinColor, 0, 0, 0);
        self.hair = createBox(105, 20, 65, self.hairColor, 0, 50, 0);
        self.head = createGroup(0, 260, -25);
        self.head.add(self.face);
        self.head.add(self.hair);

        self.torso = createBox(150, 190, 40, self.shirtColor, 0, 100, 0);

        self.leftLowerArm = createLimb(20, 120, 30, self.skinColor, 0, -170, 0);
        self.leftArm = createLimb(30, 140, 40, self.skinColor, -100, 190, -10);
        self.leftArm.add(self.leftLowerArm);

        self.rightLowerArm = createLimb(20, 120, 30, self.skinColor, 0, -170, 0);
        self.rightArm = createLimb(30, 140, 40, self.skinColor, 100, 190, -10);
        self.rightArm.add(self.rightLowerArm);

        self.leftLowerLeg = createLimb(40, 200, 40, self.skinColor, 0, -200, 0);
        self.leftLeg = createLimb(50, 170, 50, self.shortsColor, -50, -10, 30);
        self.leftLeg.add(self.leftLowerLeg);

        self.rightLowerLeg = createLimb(40, 200, 40, self.skinColor, 0, -200, 0);
        self.rightLeg = createLimb(50, 170, 50, self.shortsColor, 50, -10, 30);
        self.rightLeg.add(self.rightLowerLeg);

        self.element = createGroup(0, 0, -300);
        self.element.add(self.head);
        self.element.add(self.torso);
        self.element.add(self.leftArm);
        self.element.add(self.rightArm);
        self.element.add(self.leftLeg);
        self.element.add(self.rightLeg);

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
        self.element.rotation.y += 0.02;
        self.element.position.y = sinusoid(2 * self.stepFreq, 0, 20, 0);
        self.head.rotation.x = sinusoid(2 * self.stepFreq, -10, -5, 0) * deg2Rad;
        self.torso.rotation.x = sinusoid(2 * self.stepFreq, -10, -5, 180) * deg2Rad;
        self.leftArm.rotation.x = sinusoid(self.stepFreq, -70, 50, 180) * deg2Rad;
        self.rightArm.rotation.x = sinusoid(self.stepFreq, -70, 50, 0) * deg2Rad;
        self.leftLowerArm.rotation.x = sinusoid(self.stepFreq, 70, 140, 180) * deg2Rad;
        self.rightLowerArm.rotation.x = sinusoid(self.stepFreq, 70, 140, 0) * deg2Rad;
        self.leftLeg.rotation.x = sinusoid(self.stepFreq, -20, 80, 0) * deg2Rad;
        self.rightLeg.rotation.x = sinusoid(self.stepFreq, -20, 80, 180) * deg2Rad;
        self.leftLowerLeg.rotation.x = sinusoid(self.stepFreq, -130, 5, 240) * deg2Rad;
        self.rightLowerLeg.rotation.x = sinusoid(self.stepFreq, -130, 5, 60) * deg2Rad;
    }

}

/** 
 * World dimana Wild Run ditempatkan.
 */
function World(element) {

    // Explicit binding.
    var self = this;

    // Variabel yang ada pada world.
    var scene, camera, character, renderer, light, shadowLight;

    // Inisialisasi world.
    init();

    /**
     * Membangun renderer, latar, cahaya, kamera, dan karakter,
     * lalu mulai dengan loop rendering.
     */
    function init() {

        // Inisialisasi renderer.
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        element.appendChild(renderer.domElement);

        // Inisialisasi latar.
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x363d3d, -1, 3000);

        // Inisialisasi cahaya.
        light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
        shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
        shadowLight.position.set(200, 200, 200);
        shadowLight.castShadow = true;
        scene.add(light);
        scene.add(shadowLight);

        // Inisialisasi kamera dengan field of view, aspek rasio, bidang dekat dan jauh.
        camera = new THREE.PerspectiveCamera(
            60, window.innerWidth / window.innerHeight, 1, 2000);
        camera.position.set(0, 400, 800);
        camera.lookAt(new THREE.Vector3(0, 150, 0));
        window.camera = camera;

        // Menyiapkan kemampuan untuk mengubah sebuah ukuran.
        window.addEventListener('resize', handleWindowResize, false);

        // Iniasialisasi karakter dan memasukannya ke dalam latar.
        character = new Character();
        scene.add(character.element);

        // Mulai rendering loop.
        loop();

    }

    /**
     * Animasi loop utama.
     */
    function loop() {
        character.update();
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
    }

    /**
     * Sebuah method dipanggil ketika layar dirubah ukurannya.
     */
    function handleWindowResize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

}