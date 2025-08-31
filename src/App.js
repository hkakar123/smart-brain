// App.js (Fully integrated with spinner and image load fix)
import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import './App.css';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Modal from './components/Modal/Modal';
import Profile from './components/Profile/Profile';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';

const API_BASE_URL = process.env.REACT_APP_API_URL;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      init: false,
      input: '',
      imageUrl: '',
      box: [],
      route: 'signin',
      isSignedIn: false,
      isProfileOpen: false,
      detectError: '',
      detecting: false,
      loading: true,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: '',
        pet: '',
        age: '',
        avatar: ''
      }
    };
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
        pet: data.pet || '',
        age: data.age || '',
        avatar: data.avatar || ''
      }
    });
  }

  async componentDidMount() {
    const initParticles = async (engine) => {
      await loadSlim(engine);
    };

    const { initParticlesEngine } = await import("@tsparticles/react");
    await initParticlesEngine(initParticles);
    this.setState({ init: true });

    const token = window.sessionStorage.getItem('token');
    if (token) {
      try {
        const resp = await fetch(`${API_BASE_URL}/signin`, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        });
        const data = await resp.json();
        if (data && data.id) {
          const profileResp = await fetch(`${API_BASE_URL}/profile/${data.id}`, {
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            }
          });
          const user = await profileResp.json();
          if (user && user.email) {
            this.loadUser(user);
            this.setState({ isSignedIn: true, route: 'home' });
          }
        }
      } catch (err) {
        console.error('Persistent login failed:', err);
      }
    }
    this.setState({ loading: false });
  }

  onInputChange = (event) => {
    this.setState({ input: event.target.value });
  };

  calculateFaceLocations = (data, image) => {
    if (!data.outputs || !data.outputs[0].data.regions || !image) return [];
    const width = image.width;
    const height = image.height;

    return data.outputs[0].data.regions.map(region => {
      const boundingBox = region.region_info.bounding_box;
      return {
        leftCol: boundingBox.left_col * width,
        topRow: boundingBox.top_row * height,
        rightCol: width - (boundingBox.right_col * width),
        bottomRow: height - (boundingBox.bottom_row * height),
      };
    });
  };

  displayFaceBox = (boxes) => {
    if (boxes) {
      this.setState({ box: boxes });
    }
  };

  onButtonSubmit = () => {
    if (!this.state.input.trim()) {
      this.setState({ detectError: 'Please enter a valid image URL before detecting.' });
      return;
    }

    this.setState({ detectError: '', detecting: true });
    this.setState({ imageUrl: this.state.input, box: [] });
  };

  onImageLoad = async (image) => {
    const { input } = this.state;
    if (!input) return;

    try {
      const resp = await fetch(`${API_BASE_URL}/imageurl`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': window.sessionStorage.getItem('token')
        },
        body: JSON.stringify({ input })
      });
      const data = await resp.json();
      if (!data || !data.outputs) return;

      // Update entries
      fetch(`${API_BASE_URL}/image`, {
        method: 'put',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': window.sessionStorage.getItem('token')
        },
        body: JSON.stringify({ id: this.state.user.id })
      })
      .then(res => res.json())
      .then(count => {
        this.setState(prevState => ({
          user: { ...prevState.user, entries: Number(count.entries ?? count) }
        }));
      })
      .catch(console.log);

      const boxes = this.calculateFaceLocations(data, image);
      this.displayFaceBox(boxes);
    } catch (err) {
      console.error(err);
      this.setState({ detectError: 'Something went wrong. Try again.' });
    } finally {
      this.setState({ detecting: false });
    }
  };

  onRouteChange = async (route) => {
    if(route === 'signout') {
      const token = window.sessionStorage.getItem('token');
      if(token){
        try {
          await fetch(`${API_BASE_URL}/signout`, {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            }
          });
        } catch(err) {
          console.error('Error signing out:', err);
        }
      }
      window.sessionStorage.removeItem('token');
      return this.setState({
        isSignedIn: false,
        user: { id: '', name: '', email: '', entries: 0, joined: '', pet: '', age: '', avatar: '' },
        route: 'signin',
        imageUrl: '',
        input: '',
        box: [],
        detectError: ''
      });
    } else if(route === 'home') {
      this.setState({ route: route, isSignedIn: true });
    } else {
      this.setState({ route: route });
    }
  }

  toggleModal = () => {
    this.setState(prevState => ({ isProfileOpen: !prevState.isProfileOpen }));
  }

  render() {
    const { isSignedIn, imageUrl, route, box, detectError, detecting, isProfileOpen, user, loading } = this.state;

    if (loading) return <LoadingScreen />;

    return (
      <div className="App">
        {this.state.init && (
          <Particles className="particles" id="tsparticles"
            options={{
              background: { color: { value: "transparent" }},
              fpsLimit: 120,
              interactivity: {
                events: { onClick: { enable: true, mode: "push" }, onHover: { enable: true, mode: "repulse" }, resize: true },
                modes: { push: { quantity: 4 }, repulse: { distance: 200, duration: 0.4 } }
              },
              particles: {
                color: { value: "#ffffff" },
                links: { color: "#ffffff", distance: 150, enable: true, opacity: 0.5, width: 1 },
                move: { direction: "none", enable: true, outModes: { default: "bounce" }, speed: 2 },
                number: { density: { enable: true, area: 800 }, value: 200 },
                opacity: { value: 0.5 },
                shape: { type: "image", image: { src: "https://craftkreatively.com/cdn/shop/files/412152fa-fa1c-5994-b289-f115f30df93e.jpg?v=1710446922&width=2363", width: 32, height: 32 }},
                size: { value: { min: 1, max: 5 } }
              },
              detectRetina: true
            }}
          />
        )}

        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} toggleModal={this.toggleModal} user={user}/>
        
        { route === 'home' ?
          <div>
            { isProfileOpen && (
              <Modal>
                <Profile loadUser={this.loadUser} user={user} isProfileOpen={isProfileOpen} toggleModal={this.toggleModal}/>
              </Modal>
            )}
            <Logo />
            <Rank name={user.name} entries={user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit} />
            <FaceRecognition
              imageUrl={imageUrl}
              box={box}
              error={detectError}
              detecting={detecting}
              onImageLoad={this.onImageLoad}
            />
          </div>
          : (route === 'signin'
            ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    );
  }
}

export default App;
