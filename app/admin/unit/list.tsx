import { Datagrid, List, TextField, NumberField, ReferenceField } from 'react-admin';

export const UnitList = () => {
    return (
        <List>
            <Datagrid rowClick = "edit">
                <NumberField source = "id" />
                <TextField source = "title" />
                <TextField source = "description" />
                {/* The API Response for units should include a courseId field */}
                <ReferenceField source = "courseId" reference = "courses" />
                <NumberField source = "order" />
            </Datagrid>
        </List>
    )
}