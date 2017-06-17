/**
 * Created by Ricardo on 2017/6/8.
 */
//单个魔方边长
var LENGTH = 20;
//旋转方向，RIGHT表示逆时针，LEFT表示顺时针
var RIGHT = 1;
var LEFT = -1;
//帧速
var FRAME_SPEED = 20;

var PLUS = 20;
var CENTER = 0;
var MINUS = -20;


var SINGLE_ANGLE = Math.PI/40;
var TOTAL_TIMES = 20;

var scene;      //场景
var camera;     //相机
var renderer;   //渲染器


var cubes = []; //所有魔方
var activeCubes = [];   //转动的方块

var parent;     //父类魔方



//方向
var direction = [[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1]];
//按顺序，白色，黄色，红色，橙色，蓝色，绿色，
var hexs = [0xFFFFFF,0xFDCC09,0xDC422F,0xFF6C00,0x3D81F6,0x009D54];



//初始化类，用于初始化魔方，场景，相机，渲染器
function initObj(){
    this.initSce = function () {
        scene = new THREE.Scene();
    }
    this.initRenderer = function () { 
        var eDom = $('#canvers-frame');       
        var width = eDom.width();
        var height = eDom.height();
        renderer = new THREE.WebGLRenderer({
            antialias: true
        })
        renderer.setSize(width,height);
        renderer.setClearColor(0xFFFFFF, 1.0);
        eDom.append(renderer.domElement);
        return this;
    }
    this.initCamera = function(){
        var eDom = $('#canvers-frame');
        var width = eDom.width();
        var height = eDom.height();
        camera = new THREE.PerspectiveCamera(45,width/height,1,10000);
        camera.position.z = 125;
        camera.position.y = 150;
        camera.position.x = 125;
        camera.up.x = 0;
        camera.up.y = 0.8;
        camera.up.z = 0;
        camera.lookAt(scene.position);
        scene.add(camera);
        return this;
    }
    this.initCube = function(){

        var geometry = new THREE.BoxGeometry(LENGTH,LENGTH,LENGTH);
        parent = new THREE.Object3D();
        
        //共12个面，每一个正方形面由两个三角形面组成
        for ( var i = 0,j = 0; i < geometry.faces.length; i +=2,j++) {
            geometry.faces[ i ].color.setHex( hexs[j] );
            geometry.faces[ i + 1 ].color.setHex( hexs[j] );

        }
        
        var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors} );
        
        var item = 0;
        //生成魔方
        for(var j = -1;j < 2;j++){
            var centerCube = new THREE.Mesh( geometry,material);

            centerCube.position = new THREE.Vector3(0,0,0);
            centerCube.position.z = j*LENGTH;

            centerCube.item = item;
            item++;
            var edges = new THREE.EdgesHelper(centerCube,0x000000);
            cubes.push(centerCube);
            scene.add(centerCube);
            scene.add(edges);
            for(var i = 0;i < 8;i++){
                var tempCube = new THREE.Mesh( geometry,material);
                tempCube.position = new THREE.Vector3(0,0,0);
                tempCube.position.x = direction[i][0]*LENGTH;
                tempCube.position.y = direction[i][1]*LENGTH;
                tempCube.position.z = j*LENGTH;

                tempCube.item = item;
                item++;

                var edges = new THREE.EdgesHelper(tempCube,0x000000);
                cubes.push(tempCube);
                scene.add(tempCube);
                scene.add(edges);
            }
        }
        return this;
    }

    this.render = function(){
        renderer.clear();
        renderer.render(scene,camera);
        
    }

    this.initGrid = function(){
        var helper = new THREE.GridHelper( 1000, 20 );
        helper.setColors( 0x0000ff, 0x808080 );
        scene.add( helper );
    }

    this.ThreeStart = function(){
        this.initSce();
        this.initCube();
        this.initCamera();
        this.initRenderer();
        //debug用
        //this.initGrid();
        this.render();
    }
}
initObj.prototype={
    constructor: initObj
}

function changeObj() {


    this.centerRotate = function(element,direct,axis){
        var time = 0;                      //旋转次数
        //第三步
        parent.rotation.set(0,0,0);
        parent.updateMatrixWorld();

        //第四步
        element.forEach(function (e) {
            THREE.SceneUtils.attach(e,scene,parent);
        })

        //第五步
        scene.add(parent);

        //单次旋转
        function singleTurn(){
            //父类在对应轴上进行旋转
            parent.rotation[axis] += direct*SINGLE_ANGLE;
            parent.updateMatrixWorld();            //更新状态
            renderer.render(scene,camera);         //渲染
            time ++;
            if(time === TOTAL_TIMES){
                parent.updateMatrixWorld();

                element.forEach(function (cube) {
                    //对应第一步：更新每个魔方信息
                    cube.updateMatrixWorld();
                    //第二步：解除绑定
                    THREE.SceneUtils.detach(cube, parent, scene);
                })
                scene.remove(parent);
                clearInterval(timer);
            }
        }

        var timer = setInterval(singleTurn,FRAME_SPEED);
    }
}
changeObj.prototype={
    constructor: changeObj
}


var transObj = new changeObj();

var Obj = new initObj();

function nearlyEqual(a, b, d) {
    d = d || 0.001;
    return Math.abs(a - b) <= d;
}


//设置需要旋转的魔方
function setActiveCubes(axis,direction) {
    activeCubes = [];
    cubes.forEach(function (cube) {
        if (nearlyEqual(cube.position[axis],direction)){
            activeCubes.push(cube);
        }
    })
}


$(document).ready(function(){
    Obj.ThreeStart();

    var idRotateMap = {
        'turn_right': [RIGHT, 'y'],
        'turn_left': [LEFT, 'y'],
        'right_up': [RIGHT,'z'],
        'right_down': [LEFT,'z'],
        'left_up': [LEFT,'x'],
        'left_down': [RIGHT,'x'],
        'row1_right': [RIGHT,'y'],
        'row2_right': [RIGHT,'y'],
        'row3_right': [RIGHT,'y'],
        'row1_left': [LEFT,'y'],
        'row2_left': [LEFT,'y'],
        'row3_left': [LEFT,'y'],
        'xColumn1_right': [LEFT,'x'],
        'xColumn2_right': [LEFT,'x'],
        'xColumn3_right': [LEFT,'x'],
        'xColumn1_left': [RIGHT,'x'],
        'xColumn2_left': [RIGHT,'x'],
        'xColumn3_left': [RIGHT,'x'],
        'zColumn1_right': [RIGHT,'z'],
        'zColumn2_right': [RIGHT,'z'],
        'zColumn3_right': [RIGHT,'z'],
        'zColumn1_left': [LEFT,'z'],
        'zColumn2_left': [LEFT,'z'],
        'zColumn3_left': [LEFT,'z'],
    }

    var idPositionMap = {
        'row1_right': PLUS,
        'row1_left': PLUS,
        'row2_right': CENTER,
        'row2_left': CENTER,
        'row3_right': MINUS,
        'row3_left': MINUS,
        'xColumn1_right': PLUS,
        'xColumn1_left': PLUS,
        'xColumn2_right': CENTER,
        'xColumn2_left': CENTER,
        'xColumn3_right': MINUS,
        'xColumn3_left': MINUS,
        'zColumn1_right': PLUS,
        'zColumn1_left': PLUS,
        'zColumn2_right': CENTER,
        'zColumn2_left': CENTER,
        'zColumn3_right': MINUS,
        'zColumn3_left': MINUS,

    }



    $('.board').click(function(event) {
        var id = event.target.id;
        var direction = idRotateMap[id][0];
        var axis = idRotateMap[id][1];
        transObj.centerRotate(cubes,direction, axis);
    })

    $('.row').click((function (event) {
        var id = event.target.id;
        var position = idPositionMap[id];
        var direction = idRotateMap[id][0];
        var axis = idRotateMap[id][1];

        setActiveCubes(axis,position);

        transObj.centerRotate(activeCubes,direction,axis);
    }))
    $('.xColumn').click((function (event) {
        var id = event.target.id;
        var position = idPositionMap[id];
        var direction = idRotateMap[id][0];
        var axis = idRotateMap[id][1];

        setActiveCubes(axis,position);

        transObj.centerRotate(activeCubes,direction,axis);
    }))

    $('.zColumn').click((function (event) {
        var id = event.target.id;
        var position = idPositionMap[id];
        var direction = idRotateMap[id][0];
        var axis = idRotateMap[id][1];

        setActiveCubes(axis,position);

        transObj.centerRotate(activeCubes,direction,axis);
    }))
    
})