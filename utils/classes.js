const classes = {
  //common
  flex: {
    display: 'flex',
  },
  visible: {
    display: 'initial',
  },
  hidden: {
    display: 'none',
  },
  sort: {
    marginRight: 1,
  },
  fullHeight: { height: '100vh' },
  fullWidth: {
    width: '100%',
  },
  error: {
    color: '#f04040',
  },
  form: {
    width: '100%',
    maxWidth: 800,
    margin: '0 auto',
  },
  //layout
  main: {
    marginTop: 2,
    minHeight: '80vh',
  },
  footer: {
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    marginTop: 1,
    marginBottom: 1,
  },
  // header
  appbar: {
    backgroundColor: '#203040',
    '& a': {
      color: '#ffffff',
      marginLeft: 1,
    },
  },
  toolbar: {
    justifyContent: 'space-between',
  },
  brand: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },
  grow: {
    flexGrow: 1,
  },
  navbarButton: {
    color: '#ffffff',
    textTransform: 'initial',
  },

  menuButton: { padding: 0 },

  buttonMargin: {
    marginTop: 20,
  },

  // loading circle position on button
  buttonProgress: {
    color: '#4CAF50',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },

  // search

  searchForm: {
    border: '1px solid #ffffff',
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  searchInput: {
    paddingLeft: 1,
    color: '#000000',
    '& ::placeholder': {
      color: '#606060',
    },
  },
  searchButton: {
    backgroundColor: '#f8c040',
    padding: 1,
    borderRadius: '0 5px 5px 0',
    '& span': {
      color: '#000000',
    },
  },

  // home page image carousel
  homeCarousel: {
    display: 'flex',
    justifyContent: 'center',
  },
  productCarousel: {
    '& .slider img': {
      height: '55vh',
      objectFit: 'contain',
    },
    '& .thumbs img': {
      height: '7vh',
      objectFit: 'contain',
    },
  },

  // review
  reviewItem: {
    marginRight: '1rem',
    borderRight: '1px #808080 solid',
    paddingRight: '1rem',
  },

  // map
  mapInputBox: {
    position: 'absolute',
    display: 'flex',
    left: 0,
    right: 0,
    margin: '10px auto',
    width: 300,
    height: 40,
    '& input': {
      width: 250,
    },
  },
  productContainer: {
    '& .product-card img': {
      height: '20vmax',
      objectFit: 'contain',
    },
  },
  productContainerSm: {
    flexDirection: 'column',
    '& .product-card': {
      width: '100%',
      '& img': {
        height: '35vmax',
        objectFit: 'contain',
      },
    },
  },
}

export default classes
