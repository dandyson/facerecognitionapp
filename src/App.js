import React, { useState } from 'react';
import Particles from 'react-tsparticles';
import Logo from './components/Logo/Logo';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Rank from './components/Rank/Rank';
import './App.css';

const particlesOptions = {
  particles: {
    number: {
      value: 75,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

function App() {
  const [state, setState] = useState(initialState);

  const loadUser = (data) => {
    setState({
      ...state,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  const calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  const displayFaceBox = (box) => {
    setState({
      ...state,
      box: box
    });
  }

  const onInputChange = (event) => {
    setState({
      ...state,
      input: event.target.value
    });
  }

  const onButtonSubmit = () => {
    setState({
      ...state,
      imageUrl: state.input
    });
    fetch('https://hidden-cove-56083.herokuapp.com/imageurl', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://hidden-cove-56083.herokuapp.com/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              setState({
                ...state,
                user: {
                  ...state.user,
                  entries: count
                }
              })
            })
            .catch(console.log)

        }
        displayFaceBox(calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  const onRouteChange = (route) => {
    if (route === 'signout') {
      setState(initialState)
    } else if (route === 'home') {
      setState({
        ...state,
        isSignedIn: true
      })
    }
    setState({
      ...state,
      route: route
    });
  }

  return (
    <div className="App">
      <Particles className='particles'
        params={particlesOptions}
      />
      <Navigation isSignedIn={state.isSignedIn} onRouteChange={onRouteChange} />
      {state.route === 'home'
        ? <div>
          <Logo />
          <Rank
            name={state.user.name}
            entries={state.user.entries}
          />
          <ImageLinkForm
            onInputChange={onInputChange}
            onButtonSubmit={onButtonSubmit}
          />
          <FaceRecognition box={state.box} imageUrl={state.imageUrl} />
        </div>
        : (
          state.route === 'signin'
            ? <SignIn loadUser={loadUser} onRouteChange={onRouteChange} />
            : <Register loadUser={loadUser} onRouteChange={onRouteChange} />
        )
      }
    </div>
  );
}

export default App;