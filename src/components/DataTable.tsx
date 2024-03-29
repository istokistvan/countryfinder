import {FlexboxGrid, Heading, Pagination, Table} from "rsuite";
import {gql, useQuery} from "@apollo/client";
import {useState} from "react";
import {Field, Form, Formik} from "formik";

const { Column, HeaderCell, Cell } = Table;

const LIMIT = 20

const query = gql(`
query {
  countries {
    code
    name
    capital
    currencies
    continent {
      name
    }
  }
}
`)

interface Country {
    capital?: string,
    code: string,
    currencies: Array<{name: string}>,
    name: string,
    continent: {
        name: string
    }
}

interface ResultCountry {
    capital?: string,
    code: string,
    currencies: string,
    name: string,
    continent: {
        name: string
    }
}

export default function DataTable() {

    const [page, setPage] = useState(1)
    const [continents, setContinents] = useState<string[]>([])
    const [filter, setFilter] = useState<{
        countryCode: string,
        continent: string,
        currency: string,
        picked: string
    }>({
        countryCode: '',
        continent: '',
        currency: '',
        picked: "continent"
    })

    const {loading, error, data} = useQuery(query)

    const result: ResultCountry[] = data?.countries?.map((country: Country) => {
        if (!continents.includes(country.continent.name)) {
            setContinents([...continents, country.continent.name])
        }

        return {
            ...country,
            currencies: country.currencies.join(', ')
        }
    })
        .filter((country: ResultCountry) => {
            if (filter.picked === "continent") {
                return country.continent.name.includes(filter.continent) && country.currencies.includes(filter.currency)
            } else {
                return country.code.includes(filter.countryCode)
            }
        })
        .slice((page - 1) * LIMIT, page * LIMIT)

    if (loading) return <p>Loading...</p>
    if (error) return <p>Error :(</p>

    return (
        <div>
            <Heading level={1}>Country Finder</Heading>

            <Formik
                initialValues={{
                    countryCode: '',
                    continent: '',
                    currency: '',
                    picked: "continent"
                }}
                onSubmit={values => {
                    setFilter(values)
                }}
            >{({values}) => (
                <Form>
                    <div role="group" >
                        <FlexboxGrid>
                            <FlexboxGrid.Item colspan={12}>
                                <label>
                                    <Field
                                        type="radio"
                                        name="picked"
                                        value="continent"
                                    />
                                    Search by Continent and Currency
                                </label>
                            </FlexboxGrid.Item>

                            <FlexboxGrid.Item colspan={12}>
                                <label>
                                    <Field
                                        type="radio"
                                        name="picked"
                                        value="code"
                                    />
                                    Search by Country Code
                                </label>
                            </FlexboxGrid.Item>
                        </FlexboxGrid>
                    </div>

                    <FlexboxGrid>
                        <FlexboxGrid.Item colspan={12}>
                            <Field
                                as="select"
                                name="continent"
                                placeholder="Continent"
                                disabled={values.picked !== "continent"}
                            >
                                <option value="">Select a continent</option>
                                {continents.map((continent: string) => (
                                    <option key={continent} value={continent}>{continent}</option>
                                ))}
                            </Field>

                            <Field
                                name="currency"
                                value={values.currency}
                                placeholder="Currency"
                                disabled={values.picked !== "continent"}
                            />
                        </FlexboxGrid.Item>

                        <FlexboxGrid.Item colspan={12}>
                            <Field
                                name="countryCode"
                                value={values.countryCode}
                                placeholder="Country Code"
                                disabled={values.picked !== "code"}
                            />
                        </FlexboxGrid.Item>
                    </FlexboxGrid>

                    <button type={"submit"}>Submit</button>
                </Form>
            )}
            </Formik>

            <Table
                data={result}
                height={500}
            >
                 <Column flexGrow={1}>
                    <HeaderCell>Code</HeaderCell>
                    <Cell dataKey="code" />
                 </Column>

                <Column flexGrow={1}>
                    <HeaderCell>Country</HeaderCell>
                    <Cell dataKey="name" />
                </Column>

                <Column flexGrow={1}>
                    <HeaderCell>Capital</HeaderCell>
                    <Cell dataKey="capital" />
                </Column>

                <Column flexGrow={1}>
                    <HeaderCell>Currencies</HeaderCell>
                    <Cell dataKey="currencies" />
                </Column>
            </Table>
            <Pagination
                next
                prev
                first
                last
                maxButtons={5}
                limit={LIMIT}
                activePage={page}
                onChangePage={setPage}
                total={data?.countries?.length}
                layout={['-','pager', '-']}
            />
        </div>
    )
}