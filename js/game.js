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
//template warna dicari bersama


// Make a new world when the page is loaded.
window.addEventListener('load', function() {
    new World();
});

/** 
 *
 * THE WORLD
 * 
 * The world in which Boxy Run takes place.
 *
 */

/** 
 * A class of which the world is an instance. Initializes the game
 * and contains the main game loop.
 *
 */
function World() {

    // Explicit binding of this even in changing contexts.
    var self = this;

    // Scoped variables in this world.
    var element, scene, camera, character, renderer, light, fogDistance;


    // Initialize the world.
    init();

    /**
     * Builds the renderer, scene, lights, camera, and the character,
     * then begins the rendering loop.
     */
    function init() {

        // Locate where the world is to be located on the screen.
        element = document.getElementById('world');

        // Initialize the renderer.
        renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        renderer.setSize(element.clientWidth, element.clientHeight);
        renderer.shadowMap.enabled = true;
        element.appendChild(renderer.domElement);

        // Initialize the scene.
        scene = new THREE.Scene();
        fogDistance = 40000;
        scene.fog = new THREE.Fog(0xf0fff0, 1, fogDistance);

        // Initialize the camera with field of view, aspect ratio,
        // near plane, and far plane.
        camera = new THREE.PerspectiveCamera(
            60, element.clientWidth / element.clientHeight, 1, 120000);
        camera.position.set(0, 1500, -2000);
        camera.lookAt(new THREE.Vector3(0, 600, -5000));
        window.camera = camera;

        // Set up resizing capabilities.
        window.addEventListener('resize', handleWindowResize, false);

        // Initialize the lights.
        light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        scene.add(light);


        // Initialize the character and add it to the scene.
        character = new Character();
        scene.add(character.element);


        var ground = createBox(3000, 20, 120000, Colors.ground, 0, -400, -60000); //Diana
        var ground2 = createBox(3500, 10, 120000, Colors.sidewalk, 0, -400, -60000); //Lisa
        var ground3 = createBox(50000, 5, 120000, Colors.green, 0, -400, -60000); //Ryan
        var line1 = createBox(40, 20, 120000, Colors.roadLine, 50, -400, -60000); //Elvin
        var line2 = createBox(40, 20, 120000, Colors.roadLine, -50, -400, -60000); //Elvin
        scene.add(ground);
        scene.add(ground2);
        scene.add(ground3);
        scene.add(line1);
        scene.add(line2);
        renderer.render(scene, camera);
    }

    /**
     * A method called when window is resized.
     */
    function handleWindowResize() {
        renderer.setSize(element.clientWidth, element.clientHeight);
        camera.aspect = element.clientWidth / element.clientHeight;
        camera.updateProjectionMatrix();
    }
}


function Character() {

    // Explicit binding of this even in changing contexts.
    var self = this;

    // Character defaults that don't change throughout the game.
    this.skinColor = Colors.whiteman;
    this.hairColor = Colors.black;
    this.shirtColor = Colors.luffy;
    this.shortsColor = Colors.black;

    // Initialize the character.
    init();

    /**
     * Builds the character in depth-first order. The parts of are 
     * modelled by the following object hierarchy:
     *
     * - character (this.element)
     *    - head
     *       - face
     *       - hair
     *    - torso
     *    - leftArm
     *       - leftLowerArm
     *    - rightArm
     *       - rightLowerArm
     *    - leftLeg
     *       - rightLowerLeg
     *    - rightLeg
     *       - rightLowerLeg
     *
     * Also set up the starting values for evolving parameters throughout
     * the game.
     * 
     */
    function init() {

        // Build the character.
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

        self.rightLowerLeg = createLimb(
            40, 200, 40, self.skinColor, 0, -200, 0);
        self.rightLeg = createLimb(50, 170, 50, self.shortsColor, 50, -10, 30);
        self.rightLeg.add(self.rightLowerLeg);

        self.element = createGroup(0, 0, -4000);
        self.element.add(self.head);
        self.element.add(self.torso);
        self.element.add(self.leftArm);
        self.element.add(self.rightArm);
        self.element.add(self.leftLeg);
        self.element.add(self.rightLeg);

    }
}

function createGroup(x, y, z) {
    var group = new THREE.Group();
    group.position.set(x, y, z);
    return group;
}

function createLimb(dx, dy, dz, color, x, y, z) {
    var limb = createGroup(x, y, z);
    var offset = -1 * (Math.max(dx, dz) / 2 + dy / 2);
    var limbBox = createBox(dx, dy, dz, color, 0, offset, 0);
    limb.add(limbBox);
    return limb;
}