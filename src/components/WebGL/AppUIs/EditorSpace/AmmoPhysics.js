/* global Ammo */

import { EventDispatcher, BoxBufferGeometry, SphereBufferGeometry, DynamicDrawUsage, Clock, IcosahedronBufferGeometry, PlaneBufferGeometry, BufferGeometry, Vector3, Matrix4 } from "three";

/* eslint-disable */
function loadExt(files, after) {
  var _this=this;
  _this.files = files;
  _this.js = [];
  _this.head = document.getElementsByTagName("head")[0];
  _this.after = after || function(){};
  _this.loadStyle = function(file) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = file;
    _this.head.appendChild(link);
  };
  _this.loadScript = function(i) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = _this.js[i];
    var loadNextScript = function() {
      if (++i < _this.js.length) _this.loadScript(i);
      else _this.after();
    };
    script.onload = function() { loadNextScript() };
    _this.head.appendChild(script);
  }
  for (var i=0;i<_this.files.length;i++) {
    if (/\.js$|\.js\?/.test(_this.files[i])) _this.js.push(_this.files[i])
    if (/\.css$|\.css\?/.test(_this.files[i])) _this.loadStyle(_this.files[i])
  }
  if (_this.js.length>0) _this.loadScript(0);
  else _this.after();
}

export const loadExternal = () => {
  return new Promise((resolve) => {
    new loadExt(['/ammo/ammo.wasm.js'], () => {
      resolve(Ammo)
    })
  })
}

export const loadAmmo = async () => {
  return new Promise(async resolve => {
    if (typeof Ammo === 'undefined') {
      await loadExternal()
      resolve(loadAmmo())
    } else if (typeof Ammo === 'function') {
      // let Loader = Ammo
      Ammo({
        locateFile: () => '/ammo/ammo.wasm.wasm'
      }).then( function ( Ammo ) {
        // Ammo = Loader
        resolve(Ammo)
      });
    } else {
      resolve(Ammo)
    }
  })
}

// https://github.com/mrdoob/three.js/blob/696d7836d1fc56c4702a475e6991c4adef7357f4/examples/jsm/physics/AmmoPhysics.js#L80

export class AmmoPhysics extends EventDispatcher {
  constructor ({ onLoop, onClean }) {
    super()
    this.onLoop = onLoop
    this.onClean = onClean

    // ----

    //
    this.meshIterator = []
    this.meshToBodies = new WeakMap()

    this.bufferGeoCacheMap = new Map()

    // BufferGeometry.uuid -> geoUUIDMapShape
    this.geoCache = new Map()

    //
    this.clock = new Clock()
    // ----

    this.done = this.setup()
  }

  async setup () {
    this.Ammo = await loadAmmo()
    this.v3zero = new Ammo.btVector3( 0, 0, 0 )
    this.tempPosition = new Ammo.btVector3( 0, 0, 0 )
    this.tempQuaternion = new Ammo.btQuaternion( 0, 0, 0 )

    await this.setupWorld()
    await this.setupLoop()
  }

  async waitForSetup () {
    return await this.done
  }

  async setupLoop () {
    this.onLoop(() => {
      let delta = this.clock.getDelta()
      this.world.stepSimulation(delta, 10);

      this.onEachLoop()
    })
  }

  setMeshPosition ({ mesh, index = 0 }) {
    let { worldTransform, meshToBodies } = this
    let position = mesh.position
		if (mesh.isInstancedMesh) {
			const bodies = meshToBodies.get( mesh );
      const body = bodies[index];
      body.activate()

			body.setAngularVelocity(this.v3zero);
			body.setLinearVelocity(this.v3zero);

      worldTransform.setIdentity();
      this.tempQuaternion.setValue(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w)
      this.tempPosition.setValue(position.x, position.y, position.z)
      worldTransform.setOrigin( this.tempPosition );
      worldTransform.setRotation( this.tempQuaternion );

			body.setWorldTransform( worldTransform );
		} else if (mesh.isMesh) {
			const [ body ] = meshToBodies.get( mesh );
      body.activate()

			body.setAngularVelocity(this.v3zero);
			body.setLinearVelocity(this.v3zero);

      worldTransform.setIdentity();
      this.tempQuaternion.setValue(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w)
      this.tempPosition.setValue(position.x, position.y, position.z)
			worldTransform.setOrigin( this.tempPosition );
			worldTransform.setRotation( this.tempQuaternion );
			body.setWorldTransform( worldTransform );
		}
	}

  compose( position, quaternion, array, index ) {
    const x = quaternion.x(), y = quaternion.y(), z = quaternion.z(), w = quaternion.w();
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    array[ index + 0 ] = ( 1 - ( yy + zz ) );
    array[ index + 1 ] = ( xy + wz );
    array[ index + 2 ] = ( xz - wy );
    array[ index + 3 ] = 0;

    array[ index + 4 ] = ( xy - wz );
    array[ index + 5 ] = ( 1 - ( xx + zz ) );
    array[ index + 6 ] = ( yz + wx );
    array[ index + 7 ] = 0;

    array[ index + 8 ] = ( xz + wy );
    array[ index + 9 ] = ( yz - wx );
    array[ index + 10 ] = ( 1 - ( xx + yy ) );
    array[ index + 11 ] = 0;

    array[ index + 12 ] = position.x();
    array[ index + 13 ] = position.y();
    array[ index + 14 ] = position.z();
    array[ index + 15 ] = 1;
  }

  onEachLoop () {
    let { worldTransform, meshIterator, meshToBodies } = this

    for ( let i = 0, l = meshIterator.length; i < l; i++ ) {
			const mesh = meshIterator[ i ];

			if ( mesh.isInstancedMesh ) {
				const array = mesh.instanceMatrix.array;
				const bodies = meshToBodies.get( mesh );

				for ( let j = 0; j < bodies.length; j ++ ) {

					const body = bodies[ j ];

					const motionState = body.getMotionState();
					motionState.getWorldTransform( worldTransform );

					const position = worldTransform.getOrigin();
					const quaternion = worldTransform.getRotation();

					this.compose( position, quaternion, array, j * 16 );
				}

				mesh.instanceMatrix.needsUpdate = true;
			} else if ( mesh.isMesh ) {
				const bodies = meshToBodies.get( mesh );
        const body = bodies[0]
				const motionState = body.getMotionState();
				motionState.getWorldTransform( worldTransform );

				const position = worldTransform.getOrigin();
				const quaternion = worldTransform.getRotation();
				mesh.position.set( position.x(), position.y(), position.z() );
				mesh.quaternion.set( quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w() );
			}
		}
  }

  async setupWorld () {
    let { Ammo } = this
    this.gravityConstant = -9.8
    this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
    this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration)
    this.broadphase = new Ammo.btDbvtBroadphase()
    this.solver = new Ammo.btSequentialImpulseConstraintSolver()
    this.world = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration)
    this.world.setGravity(new Ammo.btVector3(0, this.gravityConstant, 0))

    this.worldTransform = new Ammo.btTransform()
  }

  /* API */
  async addSimpleMesh ({ mesh, mass, flags }) {
    let shape = this.getShapeFromSimpleGeo({ geometry: mesh.geometry })
    if (!shape) {
      throw new Error('shape is not found')
    }

    if (mesh.isInstancedMesh) {
      this.onAddInstancedMesh({ mesh, mass, shape, flags })
    } else if (mesh.isMesh) {
      this.onAddMesh({ mesh, mass, shape, flags })
    }
  }

  async addHullMesh ({ mesh, mass, flags }) {
    let shape = this.getHullShape({ mesh })
    if (!shape) {
      throw new Error('shape is not found')
    }

    if (mesh.isInstancedMesh) {
      this.onAddInstancedMesh({ mesh, mass, shape, flags })
    } else if (mesh.isMesh) {
      this.onAddMesh({ mesh, mass, shape, flags })
    }
  }

  getHullShape ({ mesh }) {
    let { Ammo } = this
    let geometry = mesh.geometry

    if (!(geometry instanceof BufferGeometry)) {
      console.log(geometry)
      if (!this.bufferGeoCacheMap.has(mesh.geometry.uuid)) {
        geometry = new BufferGeometry().fromGeometry(geometry)
        this.bufferGeoCacheMap.set(mesh.geometry.uuid, geometry)
      } else {
        geometry = this.bufferGeoCacheMap.get(mesh.geometry.uuid)
      }
    }

    let attributes = geometry.attributes
    let position = attributes.position
    let array = position.array
    let matrixWorld = mesh.matrixWorld

    let scale = mesh.scale
    let rootScale = 1
    let margin = 0.05

    // console.log(mesh.uuid)
    let target = new Vector3()
    geometry.computeBoundingBox()
    geometry.boundingBox.getCenter(target)
    let center = new Vector3()

    const originalHull = new Ammo.btConvexHullShape()
    originalHull.setMargin(margin)

    let inverse = new Matrix4()
    let transformM4 = new Matrix4()

    transformM4.identity()
    transformM4.makeTranslation(target.x, target.y, target.z)

    let btVertex = new Ammo.btVector3()
    const rawVertexData = array
    let vertex = new Vector3()
    for (let i = 0; i < rawVertexData.length; i += 3) {
      transformM4.multiplyMatrices(inverse, matrixWorld)
      vertex
        .set(rawVertexData[i], rawVertexData[i + 1], rawVertexData[i + 2])
        .applyMatrix4(transformM4)
        .sub(center)
      btVertex.setValue(vertex.x, vertex.y, vertex.z)
      originalHull.addPoint(btVertex, i === rawVertexData.length - 3)
    }

    originalHull.type = 'hull'
    originalHull.setMargin(margin)
    originalHull.destroy = () => {
      for (let res of originalHull.resources || []) {
        Ammo.destroy(res)
      }
      if (originalHull.heightfieldData) {
        Ammo._free(originalHull.heightfieldData)
      }
      Ammo.destroy(originalHull)
    }

    let localScale = new Ammo.btVector3(rootScale * scale.x, rootScale * scale.y, rootScale * scale.z)
    originalHull.setLocalScaling(localScale)
    Ammo.destroy(localScale)

    return originalHull
  }

  async removeMesh ({ mesh }) {
    let idx = this.meshIterator.findIndex(e => e.uuid === mesh.uuid)
    if (idx !== -1) {
      this.meshIterator.splice(idx, 1)
    }
    let bodies = this.meshToBodies.get(mesh)
    bodies.forEach(b => {
      this.world.removeRigidBody(b)
    })
    this.meshToBodies.delete(mesh)
  }

  getShapeFromSimpleGeo ({ geometry }) {
    let { Ammo } = this
    const parameters = geometry.parameters;

    if (geometry instanceof PlaneBufferGeometry) {
      const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
      const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
      const sz = 0.1;

      const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx, sy, sz ) );
      shape.setMargin( 0.05 );

      return shape;
    } else if (geometry instanceof BoxBufferGeometry) {
      const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
      const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
      const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;

      const shape = new Ammo.btBoxShape( new Ammo.btVector3( sx, sy, sz ) );
      shape.setMargin( 0.05 );

      return shape;
    } else if (geometry instanceof SphereBufferGeometry || geometry instanceof IcosahedronBufferGeometry) {
      const radius = parameters.radius !== undefined ? parameters.radius : 1;

      const shape = new Ammo.btSphereShape( radius );
      shape.setMargin( 0.05 );

      return shape;
    }

    return null;
  }

  onAddInstancedMesh({ mesh, mass = 0, shape, flags = {} }) {
    let { Ammo, world } = this
    const array = mesh.instanceMatrix.array;

		const bodies = [];

		for ( let i = 0; i < mesh.count; i ++ ) {

			const index = i * 16;

			const transform = new Ammo.btTransform();
			transform.setFromOpenGLMatrix( array.slice( index, index + 16 ) );

			const motionState = new Ammo.btDefaultMotionState( transform );

			const localInertia = new Ammo.btVector3( 0, 0, 0 );
			shape.calculateLocalInertia( mass, localInertia );

			const rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );

			const body = new Ammo.btRigidBody( rbInfo );
      world.addRigidBody( body );

      for (let kn in flags) {
        body[kn] = flags[kn]
      }

			bodies.push( body );
    }

		// if (mass > 0) {
      mesh.instanceMatrix.setUsage(DynamicDrawUsage)
			this.meshIterator.push( mesh );
			this.meshToBodies.set( mesh, bodies );
		// }
  }

  onAddMesh ({ mesh, flags = {}, mass = 0, shape }) {
    let { Ammo, world } = this
    const position = mesh.position;
		const quaternion = mesh.quaternion;

		const transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin( new Ammo.btVector3( position.x, position.y, position.z ) );
		transform.setRotation( new Ammo.btQuaternion( quaternion.x, quaternion.y, quaternion.z, quaternion.w ) );

		const localInertia = new Ammo.btVector3( 0, 0, 0 );
		shape.calculateLocalInertia(mass, localInertia);

		const motionState = new Ammo.btDefaultMotionState( transform );
		const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);

    const body = new Ammo.btRigidBody( rbInfo );

    for (let kn in flags) {
      body[kn] = flags[kn]
    }

		// body.setFriction( 4 );
    world.addRigidBody(body);

		// if (mass > 0) {
      this.meshIterator.push(mesh)
      this.meshToBodies.set(mesh, [body])
		// }
  }

}