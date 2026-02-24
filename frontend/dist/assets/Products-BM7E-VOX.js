import{F as N,H as R,L as h,U as C,j as e,m as b,a as E,r as v,W as L,S as M,O as k,C as P,b as S,V as d,c as f,M as z,P as T}from"./index-By3V3s7V.js";const F={"family-protection":C,"password-monitor":h,"quantum-backup":R,"biometric-auth":N};function H({product:i,index:o}){const t=F[i.id]||h;return e.jsx(b.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:o*.1},whileHover:{y:-4},children:e.jsx(E,{to:`/products/${i.id}`,children:e.jsxs("div",{className:`product-card ${i.popular?"product-card-popular":""}`,children:[i.popular&&e.jsx("span",{className:"product-badge",children:"Популярный"}),e.jsx("div",{className:"product-icon",children:e.jsx(t,{className:"w-8 h-8 text-vg-accent"})}),e.jsx("h3",{className:"product-title",children:i.title}),e.jsx("p",{className:"product-description",children:i.description}),e.jsx("ul",{className:"product-features",children:i.features.map((a,c)=>e.jsx("li",{children:a},c))}),e.jsx("p",{className:"product-price",children:i.price})]})})})}const A=new d(59/255,130/255,246/255),I=new d(0,1,170/255),O=new d(139/255,92/255,246/255);function V(){const i=v.useRef(null);return v.useEffect(()=>{const o=i.current;if(!o)return;const t=new L({antialias:!0,alpha:!0});t.setPixelRatio(window.devicePixelRatio),o.appendChild(t.domElement);const a=new M,c=new k(-1,1,1,-1,0,1),x=new P,w=`
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,y=`
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;
      uniform vec3 c1;
      uniform vec3 c2;
      uniform vec3 c3;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(random(i), random(i + vec2(1.0,0.0)), u.x),
          mix(random(i + vec2(0.0,1.0)), random(i + vec2(1.0,1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv    = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse      - 0.5 * iResolution.xy) / iResolution.y;

        float t = iTime * 0.2;

        vec2 p = uv;
        p.y += 0.5;
        float f = fbm(vec2(p.x * 2.0, p.y + t));
        float curtain = smoothstep(0.1, 0.5, f) * (1.0 - p.y);

        float d = length(uv - mouse);
        float flare = smoothstep(0.3, 0.0, d);

        vec3 color = mix(c1, c2, p.y) * curtain;
        color += mix(c2, c3, p.x * 0.5 + 0.5) * flare * curtain * 2.0;

        gl_FragColor = vec4(color, 1.0);
      }
    `,r={iTime:{value:0},iResolution:{value:new f},iMouse:{value:new f(-100,-100)},c1:{value:A},c2:{value:I},c3:{value:O}},u=new S({vertexShader:w,fragmentShader:y,uniforms:r}),m=new z(new T(2,2),u);a.add(m);const l=()=>{const n=o.clientWidth,s=o.clientHeight;t.setSize(n,s),r.iResolution.value.set(n,s)};window.addEventListener("resize",l),l();const p=n=>{const s=o.getBoundingClientRect(),g=n.clientX-s.left,j=s.bottom-n.clientY;r.iMouse.value.set(g,j)};return window.addEventListener("mousemove",p),t.setAnimationLoop(()=>{r.iTime.value=x.getElapsedTime(),t.render(a,c)}),()=>{window.removeEventListener("resize",l),window.removeEventListener("mousemove",p),t.setAnimationLoop(null);const n=t.domElement;n.parentNode&&n.parentNode.removeChild(n),u.dispose(),m.geometry.dispose(),t.dispose()}},[]),e.jsx("div",{ref:i,className:"aurora-shader-container",style:{position:"fixed",top:0,left:0,width:"100vw",height:"100vh",zIndex:-1,pointerEvents:"none"},"aria-hidden":!0})}const W=[{id:"family-protection",title:"Семейная защита",description:"Защитите до 5 членов семьи под одной подпиской. Мониторинг входов, предсказание угроз, автоматические бэкапы.",icon:"family",features:["Предиктивная аналитика","Мониторинг 24/7","До 5 пользователей"],price:"499 ₽/мес",popular:!0},{id:"password-monitor",title:"Монитор утечек",description:"Проверяйте, не утекли ли ваши пароли. Мгновенные уведомления о новых утечках.",icon:"lock",features:["Проверка по базе утечек","Уведомления в реальном времени","10 000+ баз"],price:"199 ₽/мес",popular:!1},{id:"quantum-backup",title:"Квантовый бэкап",description:"Пост-квантовое шифрование для ваших фото, контактов и документов. Неприступно навсегда.",icon:"backup",features:["PQC шифрование","Автоматический бэкап","100 ГБ хранилища"],price:"299 ₽/мес",popular:!1},{id:"biometric-auth",title:"Биометрический вход",description:"Вход по лицу для всей семьи. Забудьте о паролях.",icon:"biometric",features:["Распознавание лиц","Шифрование шаблонов","До 10 пользователей"],price:"149 ₽/мес",popular:!1}];function q(){return e.jsxs("div",{className:"relative min-h-screen",children:[e.jsx(V,{}),e.jsxs("div",{className:"page-container relative z-10",children:[e.jsx("h1",{className:"gradient-text",children:"Наши продукты"}),e.jsx("p",{className:"page-subtitle",children:"Выберите защиту, которая подходит именно вашей семье"}),e.jsx("div",{className:"products-grid",children:W.map((i,o)=>e.jsx(H,{product:i,index:o},i.id))})]})]})}export{q as default};
