class PlatziReactive{

    //dependencia
    deps = new Map();

    constructor(options) {//nuestro constructor tiene opciones
        this.origen = options.data();//origen de la informacion que se mantendra reactiva dentro de la aplicacion

        const self = this;
        //destino
        /* reflcect es un espejo de las trampas */
        this.$data = new Proxy(this.origen, {
/*------------------------trampas-------------------------------- */
            get(target, name){//trampa get ver quien esta intentando tener una propiedad de nuestro objeto
                console.log(target, name);
                if(Reflect.has(target, name)){//donde pregunta si un objeto en particular tiene una propiedad en particular
                    
                    self.track(target, name);/** ejecutar track (objeto de destino, nombre de la propiedad) */

                    return Reflect.get(target, name);
                }
                console.warn("La propiedad ", name, "No Existe");
                return "";
            },
            set(target, name, value){// intentando modificar un objeto
                console.log("modificando");
                Reflect.set(target, name, value);
                self.trigger(name);
            }


        });
    }

    track(target, name){ //objeto de destino y propiedad a la que se quiere acceder
        if(!    this.deps.has(name)){// si no se encuentra la dependencoa
            const effect = () => {
                //buscar los p-text que se encuentren anidado a una propiedad especifica
                document.querySelectorAll(`*[p-text=${name}`).forEach(el=>{ //recorrer dependencia
                    //pasat valores
                    this.pText(el, target, name);//modificarla
                });
            };
            this.deps.set(name, effect);//lo pasamos a la dependencia
        }
    }

    trigger(name){//nombre de la dependencia
        const effect = this.deps.get(name);//nombre de la dependenca¿ia con su efecto
        effect();//ejecutar su efecto anidado con su dependencia
    }

    mount() {// se encarga de montar todo en el html
        /**
         * selecciona todo los elemmentos y va insertar informacion donde exista el p-text
         * optiene el origen de la informacion
         */
        document.querySelectorAll("*[p-text]").forEach(el =>{
            this.pText(el, this.$data, el.getAttribute("p-text")); //mostrando datos 
        });

        //montaje de lo sp-model
        document.querySelectorAll("*[p-model]").forEach(el =>{
            const name = el.getAttribute("p-model");//obtener propiedad
            this.pModel(el, this.$data, name);// (elemento. la informacion reactiva o apsado por un proxy, nombre de la propiedad a la que queremos acceder, , )

            el.addEventListener("input", () => {//cuando estemos escrbiendo
                Reflect.set(this.$data, name, el.value);//modificar la informacion de lo que mande el input
            });
        });
        document.querySelectorAll("*[p-bind]").forEach(el =>{
            this.pBind(el, this.$data, el.getAttribute("p-bind"));
            console.log("ey", this.pBind);
        });
        
    }

    pText(el, target, name) { //mostrar todo lo recibido en una etiqueta
        el.innerText = Reflect.get(target, name);//insertando datos mediante la trampa get
    }

    pModel(el, target, name) {
        el.value = Reflect.get(target, name);//cambiando valor de lo que hay en el target mediante la trmapa set
    }
    pBind(el, target, name){
        const [attribute, key] = name.split(':')//separamos arreglo en dos que quede el src y el nombre de la imagen
        el.setAttribute(attribute, Reflect.get(target, key))//el objeto de destino y nomnre de la imagen
    }
}
var Platzi = { //creamos la apicacion reactiva
    createApp(options){
        return new PlatziReactive(options);
    }
}