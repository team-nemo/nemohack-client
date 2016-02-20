$(function() {

	var socket = io.connect("http://192.168.0.147:8000");
	socket.on('connect', function () {
		socket.emit('init', { role: 'viewer' });
	});

	var ibi = 500 / 1000;
	socket.on('hrm2', function(data) {
		ibi = data.ibi / 1000;
	});

	var scene, camera, renderer;
	var geometry, material, mesh;

	function doResize() {
		var w = $(window).width();
		var h = $(window).height();
		$overlay.width(w);
		$overlay.height(h);
		renderer.setSize(w, h);
	}
	
	$overlay = $("<div style='position: fixed;'></div>");
	$('body').prepend($overlay);
	$(window).resize(function() {
		doResize();
	});
	
	init();
	doResize();
	animate();

	function init() {

		scene = new THREE.Scene();
		
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z = 1000;
		scene.add(camera);
		
		var light = new THREE.PointLight(0xffffff, 0.8);
		light.position.set(0, 0, -100);
		camera.add(light);
		
		material = new THREE.MeshPhongMaterial({
			color: 0xff0000,
			wireframe: false,
			transparent: true,
			opacity: 0
		});

		var x = -25, y = -45;

		var heartShape = new THREE.Shape(); // From http://blog.burlock.org/html5/130-paths

		heartShape.moveTo( x + 25, y + 25 );
		heartShape.bezierCurveTo( x + 25, y + 25, x + 20, y, x, y );
		heartShape.bezierCurveTo( x - 30, y, x - 30, y + 35, x - 30, y + 35 );
		heartShape.bezierCurveTo( x - 30, y + 55, x - 10, y + 77, x + 25, y + 95 );
		heartShape.bezierCurveTo( x + 60, y + 77, x + 80, y + 55, x + 80, y + 35 );
		heartShape.bezierCurveTo( x + 80, y + 35, x + 80, y, x + 50, y );
		heartShape.bezierCurveTo( x + 35, y, x + 25, y + 25, x + 25, y + 25 );
				
		var extrudeSettings = {amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1};

		geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);

		mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		renderer = new THREE.WebGLRenderer({
			alpha: true
		});
		renderer.setClearColor(0x000000, 0);

		$overlay.get(0).appendChild(renderer.domElement);
		
	}
	
	var value = 0;

	var last;
	var beatTime = 0;
	function animate() {
		var now = (new Date()).getTime() / 1000;
		var time = 0;
		if (last) {
			time = now - last;
		}
		last = now;
		beatTime += time;
		if (beatTime > ibi) {
			beatTime = beatTime - ibi;
			value = 1;
		} else {
			value -= time / ibi;
		}

		mesh.rotation.z += time;
//		mesh.rotation.y += time;
		material.opacity = 0.25 + value * 0.25;
		var scale = (0.75 + value * 0.25) * 5;
		mesh.scale.set(scale, scale, scale);

		renderer.render( scene, camera );

		requestAnimationFrame( animate );
	}
	
});