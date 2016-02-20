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

		var socket = io.connect("http://37.139.6.243:8000");
		socket.on('connect', function () {
			socket.emit('subscribe', 'alfonso');
			socket.emit('subscribe', 'beatrix');
		});

		var hearts = [
		{
			h: 0,
			targetH: 0,
			s: 1,
			targetS: 0.5,
			l: 1,
			targetL: 0.5,
			ibi: 0,
			beatValue: 0,
			beatTime: 0,
			beat: false
		}, 
		{
			h: 0,
			targetH: 0,
			s: 1,
			targetS: 0,
			l: 1,
			targetL: 0,
			ibi: 0,
			beatValue: 0,
			beatTime: 0,
			beat: false
		}];

		socket.on('alfonso', function(data) {
			console.log('alfonso', data);
			if (data.ibi) {
				hearts[0].ibi = data.ibi / 1000;
			}
			if (data.angry) {
				hearts[0].targetH = 0;
				hearts[0].targetS = 1.0 - (data.angry - data.sad - data.happy - data.surprised) / 4;
				hearts[0].targetL = 0.5;
			}
		});

		socket.on('beatrix', function(data) {
			console.log('beatrix', data);
			if (data.ibi) {
				hearts[1].ibi = data.ibi / 1000;
			}
			if (data.angry) {
				hearts[1].targetH = 0;
				hearts[1].targetS = 1.0 - (data.angry - data.sad - data.happy - data.surprised) / 4;
				hearts[1].targetL = 0.5;
			}
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
				var ambientLight = new THREE.AmbientLight(0x666666);
				hearts[index].scene.add(ambientLight);
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
				
				if (heart.ibi) {
					heart.mesh.rotation.y = - Math.PI / 3;
					heart.mesh.rotation.x = Math.sin(0.5 - heart.beatValue) * Math.PI / 8 * (i == 0 ? -1 : 1);							
				} else {
				}
				heart.mesh.rotation.z = heart.mesh.rotation.z + time;
				
				heart.mesh.position.set(100 * (i==0 ? -1 : 1), 0, 0);
				var scale = 0.8 + heart.beatValue * 0.2;
				scale = scale * (role == i ? 2 : 2);
				heart.mesh.scale.set(scale, scale, scale);
				heart.material.opacity = heart.ibi ? 0.8 + heart.beatValue * 0.2 : 0.2;
				heart.light.position.set(Math.cos(totalTime) * 100, Math.sin(totalTime) * 100, -100);
				
				heart.h = heart.h + (heart.targetH - heart.h) * time;
				heart.s = heart.s + (heart.targetS - heart.s) * time;
				heart.l = heart.l + (heart.targetL - heart.l) * time;
				
				var c = new THREE.Color();
				c.setHSL(heart.h, heart.s, heart.l);
				
				heart.material.setValues({
					color: c
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