import styles from "./CountryList.module.css";
import Spinner from "./Spinner";
import Message from "./Message";
import CountryItem from "./CountryItem";

function CountriesList({ cities, isLoading }) {
    if (isLoading) return <Spinner />;

    if (!cities.length)
        return (
            <Message message="Add your first city by clicking on a city on the map" />
        );

    const countries = cities.reduce((acc, cur) => {
        if (!acc.map((city) => city.country).includes(cur.country)) {
            return [...acc, cur];
        }
        return acc;
    }, []);

    return (
        <ul className={styles.countryList}>
            {countries.map((country) => (
                <CountryItem country={country} key={country} />
            ))}
        </ul>
    );
}

export default CountriesList;
