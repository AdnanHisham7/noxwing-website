(function () {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5);
  function resize() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);
  const C_GREEN = new THREE.Color(0x1c502a),
    C_GREEN_MID = new THREE.Color(0x2a7a40),
    C_GREEN_BRIGHT = new THREE.Color(0x3aad58),
    C_DARK = new THREE.Color(0x080d09);
  const geo = new THREE.IcosahedronGeometry(0.8, 1),
    posAttr = geo.attributes.position,
    count = posAttr.count,
    colors = new Float32Array(count * 3),
    faceCount = count / 3;
  for (let i = 0; i < faceCount; i++) {
    const t = i / faceCount,
      col = new THREE.Color();
    if (t < 0.33) col.lerpColors(C_DARK, C_GREEN, t * 3);
    else if (t < 0.66) col.lerpColors(C_GREEN, C_GREEN_MID, (t - 0.33) * 3);
    else col.lerpColors(C_GREEN_MID, C_GREEN_BRIGHT, (t - 0.66) * 3);
    for (let v = 0; v < 3; v++) {
      colors[(i * 3 + v) * 3] = col.r;
      colors[(i * 3 + v) * 3 + 1] = col.g;
      colors[(i * 3 + v) * 3 + 2] = col.b;
    }
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.MeshPhongMaterial({
      vertexColors: true,
      shininess: 80,
      specular: new THREE.Color(0x3aad58),
      flatShading: true,
    }),
    mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);
  const wireMat = new THREE.MeshBasicMaterial({
      color: C_GREEN_BRIGHT,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    }),
    wireMesh = new THREE.Mesh(geo.clone(), wireMat);
  wireMesh.scale.setScalar(1.004);
  scene.add(wireMesh);
  const ringGeo = new THREE.TorusGeometry(2.1, 0.004, 2, 100),
    ringMat = new THREE.MeshBasicMaterial({
      color: 0x1c502a,
      transparent: true,
      opacity: 0.35,
    }),
    ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.2;
  scene.add(ring);
  const ring2 = ring.clone();
  ring2.rotation.x = Math.PI / 3;
  ring2.rotation.y = Math.PI / 5;
  ring2.material = ringMat.clone();
  ring2.material.opacity = 0.18;
  scene.add(ring2);
  const partCount = 180,
    partGeo = new THREE.BufferGeometry(),
    partPos = new Float32Array(partCount * 3);
  for (let i = 0; i < partCount; i++) {
    const r = 2.2 + Math.random() * 2.5,
      theta = Math.random() * Math.PI * 2,
      phi = Math.acos(2 * Math.random() - 1);
    partPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    partPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    partPos[i * 3 + 2] = r * Math.cos(phi);
  }
  partGeo.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
  const partMat = new THREE.PointsMaterial({
      color: C_GREEN_BRIGHT,
      size: 0.025,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    }),
    particles = new THREE.Points(partGeo, partMat);
  scene.add(particles);
  scene.add(new THREE.AmbientLight(0x0d1410, 3));
  const light1 = new THREE.DirectionalLight(0x3aad58, 3);
  light1.position.set(3, 4, 5);
  scene.add(light1);
  const light2 = new THREE.DirectionalLight(0x1c502a, 2);
  light2.position.set(-4, -2, -3);
  scene.add(light2);
  const light3 = new THREE.PointLight(0x3aad58, 1.5, 8);
  light3.position.set(0, 0, 4);
  scene.add(light3);
  const origPos = new Float32Array(posAttr.array);
  let isDragging = false,
    prevMouse = { x: 0, y: 0 },
    rotVel = { x: 0, y: 0 },
    autoSpin = true,
    explodeFactor = 0,
    explodeTarget = 0,
    clickBurst = 0;
  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    autoSpin = false;
    prevMouse = { x: e.clientX, y: e.clientY };
    rotVel = { x: 0, y: 0 };
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x,
      dy = e.clientY - prevMouse.y;
    rotVel.x = dy * 0.008;
    rotVel.y = dx * 0.008;
    mesh.rotation.x += rotVel.x;
    mesh.rotation.y += rotVel.y;
    wireMesh.rotation.copy(mesh.rotation);
    prevMouse = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener("mouseup", () => {
    isDragging = false;
  });
  canvas.addEventListener(
    "touchstart",
    (e) => {
      isDragging = true;
      autoSpin = false;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    { passive: true },
  );
  window.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - prevMouse.x,
        dy = e.touches[0].clientY - prevMouse.y;
      rotVel.x = dy * 0.008;
      rotVel.y = dx * 0.008;
      mesh.rotation.x += rotVel.x;
      mesh.rotation.y += rotVel.y;
      wireMesh.rotation.copy(mesh.rotation);
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    { passive: true },
  );
  window.addEventListener("touchend", () => {
    isDragging = false;
  });
  canvas.addEventListener("click", () => {
    clickBurst = 1;
  });
  window.addEventListener("scroll", () => {
    scene.position.y = window.scrollY * 0.0012;
    particles.rotation.y = window.scrollY * 0.0008;
  });
  document.querySelectorAll(".cube-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".cube-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const m = btn.dataset.mode;
      if (m === "spin") {
        autoSpin = true;
        explodeTarget = 0;
        mat.wireframe = false;
        wireMesh.visible = true;
      } else if (m === "explode") {
        autoSpin = true;
        explodeTarget = 1;
        mat.wireframe = false;
        wireMesh.visible = true;
      } else if (m === "wire") {
        autoSpin = true;
        explodeTarget = 0;
        mat.wireframe = true;
        wireMesh.visible = false;
      } else if (m === "reset") {
        autoSpin = true;
        explodeTarget = 0;
        mat.wireframe = false;
        wireMesh.visible = true;
        mesh.rotation.set(0, 0, 0);
        wireMesh.rotation.set(0, 0, 0);
        rotVel = { x: 0, y: 0 };
        document
          .querySelectorAll(".cube-btn")
          .forEach((b) => b.classList.remove("active"));
        document.querySelector('[data-mode="spin"]').classList.add("active");
      }
    });
  });
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    if (autoSpin && !isDragging) {
      mesh.rotation.y += 0.004;
      mesh.rotation.x += 0.001;
      wireMesh.rotation.copy(mesh.rotation);
    }
    if (!isDragging && !autoSpin) {
      rotVel.x *= 0.94;
      rotVel.y *= 0.94;
      mesh.rotation.x += rotVel.x;
      mesh.rotation.y += rotVel.y;
      wireMesh.rotation.copy(mesh.rotation);
      if (Math.abs(rotVel.x) < 0.0001 && Math.abs(rotVel.y) < 0.0001) {
        autoSpin = true;
        document
          .querySelectorAll(".cube-btn")
          .forEach((b) => b.classList.remove("active"));
        document.querySelector('[data-mode="spin"]').classList.add("active");
      }
    }
    ring.rotation.z += 0.003;
    ring2.rotation.z -= 0.002;
    ringMat.opacity = 0.3 + Math.sin(t * 1.2) * 0.08;
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;
    explodeFactor += (explodeTarget - explodeFactor) * 0.04;
    if (Math.abs(explodeFactor) > 0.001) {
      const posArr = geo.attributes.position.array;
      for (let i = 0; i < faceCount; i++) {
        const cx =
            (origPos[i * 9 + 0] + origPos[i * 9 + 3] + origPos[i * 9 + 6]) / 3,
          cy =
            (origPos[i * 9 + 1] + origPos[i * 9 + 4] + origPos[i * 9 + 7]) / 3,
          cz =
            (origPos[i * 9 + 2] + origPos[i * 9 + 5] + origPos[i * 9 + 8]) / 3,
          len = Math.sqrt(cx * cx + cy * cy + cz * cz) || 1,
          nx = cx / len,
          ny = cy / len,
          nz = cz / len,
          spread = explodeFactor * 0.55;
        for (let v = 0; v < 3; v++) {
          posArr[(i * 3 + v) * 3 + 0] =
            origPos[(i * 3 + v) * 3 + 0] + nx * spread;
          posArr[(i * 3 + v) * 3 + 1] =
            origPos[(i * 3 + v) * 3 + 1] + ny * spread;
          posArr[(i * 3 + v) * 3 + 2] =
            origPos[(i * 3 + v) * 3 + 2] + nz * spread;
        }
      }
      geo.attributes.position.needsUpdate = true;
    }
    if (clickBurst > 0) {
      clickBurst -= 0.04;
      const s = 1 + Math.sin(clickBurst * Math.PI) * 0.18;
      mesh.scale.setScalar(s);
      wireMesh.scale.setScalar(s * 1.004);
    } else {
      const breath = 1 + Math.sin(t * 0.6) * 0.012;
      mesh.scale.setScalar(breath);
      wireMesh.scale.setScalar(breath * 1.004);
    }
    light3.intensity = 1.2 + Math.sin(t * 1.4) * 0.5;
    renderer.render(scene, camera);
  }
  animate();
})();
