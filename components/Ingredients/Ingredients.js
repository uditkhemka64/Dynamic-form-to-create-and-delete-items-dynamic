import React, { useEffect, useCallback, useReducer } from 'react';
import ErrorModal from '../UI/ErrorModal';
import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';


const ingredientReducer = (currentIngredients, action) => {
  switch(action.type)
  {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default:
      throw new Error('Something acually went wrong because it shouldnt be here');      
  }
}

const httpReducer = (httpState, action) => {
  switch(action.type) {
    case 'SEND':
      return {loading: true , error: null};
    case 'RESPONSE':
      return {...httpState , loading: false};
    case 'ERROR':
      return {loading: false , error: action.errorData};
    case 'CLEAR':
      return {...httpState , error: null};  
    default:
      throw new Error('Something acually went wrong because it shouldnt be here');      
  }
}

const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {loading: false,error: null});
  //const [userIngredients, setUserIngredients] = useState([]);
  //const [isLoading, setIsLoading] = useState(false);
  //const [error, setError] = useState();

  useEffect(() => {
    console.log('RENDERING INGREDIENTS', userIngredients);
  }, [userIngredients]);

  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    //setUserIngredients(filteredIngredients);
    dispatch({type: 'SET', ingredients: filteredIngredients});
  }, []);

  const addIngredientHandler = ingredient => {
    dispatchHttp({type: 'SEND'});
    fetch('https://react-hooks-511ed.firebaseio.com/ingredients.json', {
      method: 'POST',
      body: JSON.stringify(ingredient),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        dispatchHttp({type: 'RESPONSE'});
        return response.json();
      })
      .then(responseData => {
        //setUserIngredients(prevIngredients => [
        //  ...prevIngredients,
        //  { id: responseData.name, ...ingredient }
        //]);
        dispatch({type: 'ADD', ingredient: { id: responseData.name, ...ingredient }});
      });
  };

  const removeIngredientHandler = ingredientId => {
    dispatchHttp({type: 'SEND'});
    fetch('https://react-hooks-511ed.firebaseio.com/ingredients.json', {
      method: 'DELETE',
    })
    .then(response => {
      dispatchHttp({type: 'RESPONSE'});
      //setUserIngredients(prevIngredients =>
      //  prevIngredients.filter(ingredient => ingredient.id !== ingredientId)
      //);
      dispatch({type: 'DELETE', id: ingredientId});
    }).catch(error => {
      dispatchHttp({type: 'ERROR', errorData: error.message});

    })
  };

  const clearError = () => {
    dispatchHttp({type: 'CLEAR'});
    dispatchHttp({type: 'RESPONSE'})
  } 

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm 
      onAddIngredient={addIngredientHandler}
      loading={httpState.loading}/>

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
};

export default Ingredients;
