import { useEffect, useState, useCallback } from 'react'
import { Container, Grid, TextField, FormControl, InputLabel, 
  Select, CircularProgress, Card, CardContent, Button, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import axios from 'axios'
import { keys, cloneDeep } from 'lodash'
import SendIcon from '@material-ui/icons/Send';

import './App.css';

const useStyles = makeStyles((theme) => ({
  currencyBlock: {
    margin: '40px 0'
  },
  field: {
    width: '33.33%'
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20
  },
  button: {
    marginLeft: 'auto'
  },
  summary: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',
  }
}));

function App() {
  const classes = useStyles()
  const [currenyMeta, setCurrencyMeta] = useState({
    loading: true,
    details: null
  })
  const [currentConversion, setCurrentConversion] = useState({
    convertedAmount: 0,
    amount: 0,
    from: '', 
    to: ''
  })
  const [form, setForm] = useState({
    amount: {
      id: 'amount',
      value: 1,
      error: false,
      helpText: '',
      validations: {required: true, min: 1, max: 10000}
    },
    fromCurrency: {
      id: 'fromCurrency',
      value: '',
      error: false,
      helpText: '',
      validations: {required: true}
    },
    toCurrency: {
      id: 'toCurrency',
      value: '',
      error: false,
      helpText: '',
      validations: {required: true}
    }
  })

  useEffect(() => {
    axios.get('https://open.er-api.com/v6/latest/USD')
      .then(res => {
        setCurrencyMeta(prevState => ({...prevState, loading: false, details: res.data.rates}))

        const updatedForm = cloneDeep(form)

        updatedForm.fromCurrency.value = keys(res.data.rates)[0]
        updatedForm.toCurrency.value = keys(res.data.rates)[1]

        setForm(updatedForm)
      })
      .catch(err => console.log(err))
  }, [])

  const handleChange = useCallback((id, value) => {
    const updatedForm = cloneDeep(form)
    const updatedField = updatedForm[id]

    updatedField.value = value

    if(id === 'amount') {
      if(value < updatedField.validations.min){
        updatedField.value = 1
      } else if(value > updatedField.validations.max){
        updatedField.value = updatedField.validations.max
      }
    }

    setForm(updatedForm)
  }, [form])

  const submitHandler = useCallback(() => {
    const from = form.fromCurrency.value
    const to = form.toCurrency.value
    const amount = form.amount.value

    const convertedAmount = (amount * (1/currenyMeta.details[from])) * currenyMeta.details[to]

    setCurrentConversion(prevState =>({...prevState, convertedAmount, amount, from, to }))

  }, [form, currenyMeta])

  return (
    <Container maxWidth="md">
      <Grid xs={12} item className={classes.currencyBlock}>
        <Card className={classes.root}>
          <CardContent>
            {currenyMeta.loading ? <CircularProgress /> : 
              <>
              <div className={classes.formContainer}>
                <TextField 
                  className={classes.field} 
                  type='number' 
                  id="outlined-basic" 
                  label="Amount" 
                  variant="outlined" 
                  value={form.amount.value}
                  onChange={e => handleChange(form.amount.id, e.target.value) }
                  />

                <FormControl className={classes.field} variant="outlined" >
                  <InputLabel htmlFor="outlined-age-native-simple1">From</InputLabel>
                  <Select
                    native
                    value={form.fromCurrency.value}
                    onChange={e => handleChange(form.fromCurrency.id, e.target.value) }
                    label="From"
                    inputProps={{
                      name: 'From',
                      id: 'outlined-age-native-simple1',
                    }}
                  >
                    {keys(currenyMeta.details).map(currency => <option key={currency} value={currency}>{currency}</option>)}
                  </Select>
                </FormControl>

                <FormControl className={classes.field} variant="outlined">
                  <InputLabel htmlFor="outlined-age-native-simple2">To</InputLabel>
                  <Select
                    native
                    value={form.toCurrency.value}
                    onChange={e => handleChange(form.toCurrency.id, e.target.value) }
                    label="To"
                    inputProps={{
                      name: 'From',
                      id: 'outlined-age-native-simple2',
                    }}
                  >
                    {keys(currenyMeta.details).map(currency => <option key={currency} value={currency}>{currency}</option>)}
                  </Select>
                </FormControl>
              </div>
              <div className={classes.summary}>
                {console.log(currentConversion)}
                {currentConversion.convertedAmount > 0 && <Typography variant='body1'>
                  {`${currentConversion.amount} ${currentConversion.from} = ${currentConversion.convertedAmount} ${currentConversion.to}`}
                </Typography>}
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  endIcon={<SendIcon />}
                  onClick={submitHandler}
                >
                  Convert
                </Button>
              </div>
                
              </>
            }
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}

export default App;
