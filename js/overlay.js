$(function() {

	var socket = io.connect("http://192.168.0.147:8000");
	socket.on('connect', function () {
		socket.emit('init', { role: 'viewer' });
	});
	socket.on('kissa', function() {
		material.opacity = 1;
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

		geometry = new THREE.BoxGeometry( 200, 200, 200 );
		material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true, transparent: true } );

		mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );

		renderer = new THREE.WebGLRenderer({
			alpha: true
		});
		renderer.setClearColor(0x000000, 0);

		$overlay.get(0).appendChild(renderer.domElement);
		
	}

	function animate() {

		requestAnimationFrame( animate );

		mesh.rotation.x += 0.01;
		mesh.rotation.y += 0.02;
		
		material.opacity -= 0.01;

		renderer.render( scene, camera );

	}
	
});