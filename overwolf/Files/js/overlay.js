$(function() {

	$overlay = $("<div style='position: fixed; right: 0px; top: 0px;'></div>");
	$('body').prepend($overlay);

	var role;
	$button1 = $('<div style="padding: 10px; margin: 10px; border: 2px solid white; background: black; color: white; font-size: 20px;">1</div>').click(function() {
		role = 0;
		run();
	});
	$button2 = $('<div style="padding: 10px; margin: 10px; border: 2px solid white; background: black; color: white; font-size: 20px;">2</div>').click(function() {
		role = 1;
		run();
	});
	
	$overlay.append($button1).append($button2);

	function run() {
	
		$button1.remove();
		$button2.remove();

		var socket = io.connect("http://192.168.0.147:8000");
		socket.on('connect', function () {
			socket.emit('subscribe', 'alfonso');
			socket.emit('subscribe', 'beatrix');
		});

		var hearts = [
		{
			r: 1,
			targetR: 1,
			g: 1,
			targetG: 0,
			b: 1,
			targetB: 0,
			ibi: 0,
			beatValue: 0,
			beatTime: 0,
			beat: false
		}, 
		{
			r: 1,
			targetR: 1,
			g: 1,
			targetG: 0,
			b: 1,
			targetB: 0,
			ibi: 0,
			beatValue: 0,
			beatTime: 0,
			beat: false
		}];

		socket.on('alfonso', function(data) {
			console.log('alfonso',  data);
			if (data.ibi) {
				hearts[0].ibi = data.ibi / 1000;
			}
			hearts[0].targetR = Math.random();
			hearts[0].targetG = Math.random();
			hearts[0].targetB = Math.random();
			
			
			if (data.ibi) {
				hearts[1].ibi = 0.5 + Math.random();
			}
			hearts[1].targetR = Math.random();
			hearts[1].targetG = Math.random();
			hearts[1].targetB = Math.random();
			
			
		});

		socket.on('beatrix', function(data) {
			console.log('beatrix',  data);
			if (data.ibi) {
				hearts[1].ibi = data.ibi / 1000;
			}
			hearts[1].targetR = Math.random();
			hearts[1].targetG = Math.random();
			hearts[1].targetB = Math.random();
		});
		
		var camera, light, renderer;

		function doResize() {
			var w = $(window).width();
			var h = $(window).height();
			w = 300;
			h = 200;
			
			$overlay.width(w);
			$overlay.height(h);
			
			hearts[0].camera.aspect = w / h;
			hearts[0].camera.updateProjectionMatrix();
			hearts[1].camera.aspect = w / h;
			hearts[1].camera.updateProjectionMatrix();
			
			renderer.setSize(w, h);
		}
		
		$(window).resize(function() {
			doResize();
		});
		
		init();
		doResize();
		animate();

		function init() {

			function sceneSetup(index) {
				hearts[index].camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
				hearts[index].camera.position.z = 400;
				hearts[index].light = new THREE.PointLight(0xffffff, 0.8);
				hearts[index].camera.add(hearts[index].light);
				hearts[index].scene = new THREE.Scene();
				hearts[index].scene.add(hearts[index].camera);
			}
			
			sceneSetup(0);
			sceneSetup(1);

			var heartShape = new THREE.Shape(); // From http://blog.burlock.org/html5/130-paths
			
			/*
			var x = -25, y = -52.5;
			heartShape.moveTo( x + 25, y + 25 );
			heartShape.bezierCurveTo( x + 25, y + 25, x + 20, y, x, y );
			heartShape.bezierCurveTo( x - 30, y, x - 30, y + 35, x - 30, y + 35 );
			heartShape.bezierCurveTo( x - 30, y + 55, x - 10, y + 77, x + 25, y + 95 );
			heartShape.bezierCurveTo( x + 60, y + 77, x + 80, y + 55, x + 80, y + 35 );
			heartShape.bezierCurveTo( x + 80, y + 35, x + 80, y, x + 50, y );
			heartShape.bezierCurveTo( x + 35, y, x + 25, y + 25, x + 25, y + 25 );
			*/

			/*
			heartShape.moveTo(25, 0);
			heartShape.bezierCurveTo(100, 0, 0, 100, 0, 25);
			heartShape.bezierCurveTo(0, 100, -100, 0, -25, 0);
			heartShape.bezierCurveTo(-100, 0, 0, -100, 0, -25);
			heartShape.bezierCurveTo(0, -100, 100, 0, 25, 0);
			*/

			heartShape.moveTo(100, 0);
			heartShape.bezierCurveTo(100, 100, -100, 100, -100, 0);
			heartShape.bezierCurveTo(-100, -100, 100, -100, 100, 0);

			var extrudeSettings = {amount: 20, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 1, bevelThickness: 1};

			var geometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);

			hearts[0].material = new THREE.MeshPhongMaterial({
				color: 0x000000,
				wireframe: false,
				transparent: true,
//				blending: THREE.AdditiveBlending,
				depthTest: true
			});
			
			hearts[1].material = new THREE.MeshPhongMaterial({
				color: 0x000000,
				wireframe: false,
				transparent: true,
//				blending: THREE.AdditiveBlending,
				depthTest: true
			});

			hearts[0].mesh = new THREE.Mesh(geometry, hearts[0].material);
			hearts[0].scene.add(hearts[0].mesh);

			hearts[1].mesh = new THREE.Mesh(geometry, hearts[1].material);
			hearts[1].scene.add(hearts[1].mesh);
			
			renderer = new THREE.WebGLRenderer({
				alpha: true
			});
			renderer.setClearColor(0x000000, 0);
			renderer.setClearColor(0x000000, 0);
			renderer.autoClear = false;

			$overlay.get(0).appendChild(renderer.domElement);
			
		}
		
		var last;
		var totalTime = 0;
		function animate() {
			var now = (new Date()).getTime() / 1000;
			var time = 0;
			if (last) {
				time = now - last;
			}
			last = now;
			
			totalTime += time;
			
			for (var i=0 ; i<hearts.length ; i++) {
				var heart = hearts[i];
			
				heart.beatTime += time;
				if (heart.beatTime > heart.ibi) {
					heart.beatTime = heart.beatTime - heart.ibi;
					heart.beat = true;
				}
				if (heart.beat) {
					heart.beatValue = Math.min(1, heart.beatValue + time / heart.ibi * 10) || 0;
					if (heart.beatValue==1) {
						heart.beat = false;
					}
				} else {
					heart.beatValue = Math.max(0, heart.beatValue - time / heart.ibi) || 0;
				}
				heart.mesh.rotation.z = Math.PI + Math.sin(0.5 - heart.beatValue) * Math.PI / 2 * (i == 0 ? -1 : 1);
				heart.mesh.rotation.y = - Math.PI / 6;
				heart.mesh.rotation.x = Math.sin(0.5 - heart.beatValue) * Math.PI / 8 * (i == 0 ? -1 : 1);							
				
				heart.mesh.position.set(100 * (i==0 ? -1 : 1), 0, 0);
				var scale = 0.5 + heart.beatValue * 0.5;
				scale = scale * (role == i ? 1 : 2);
				heart.mesh.scale.set(scale, scale, scale);
				heart.material.opacity = 0.8 + heart.beatValue * 0.2;	
				heart.light.position.set(Math.cos(totalTime) * 100, Math.sin(totalTime) * 100, -100);				
				
				heart.r = heart.r + (heart.targetR - heart.r) * time;
				heart.g = heart.g + (heart.targetG - heart.g) * time;
				heart.b = heart.b + (heart.targetB - heart.b) * time;
				
				heart.material.setValues({
					color: new THREE.Color(heart.r, heart.g, heart.b)
				});
			}

			renderer.clear(true, true, true);
			renderer.render(hearts[0].scene, hearts[0].camera);
			renderer.clear(false, true, false);
			renderer.render(hearts[1].scene, hearts[1].camera);

			requestAnimationFrame(animate);
		}
	}
});