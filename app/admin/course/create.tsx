import { Create, SimpleForm, TextInput, required } from 'react-admin';

export const CourseCreate = () => {
    return (
        <Create>
            <SimpleForm>
                {/* source binds the input to the specified field in the resource */}
                <TextInput
                    source = "title"
                    validate = {[required()]}
                    label = "Title"
                />
                <TextInput
                    source = "imageSrc"
                    validate = {[required()]}
                    label = "Image Source"
                />
            </SimpleForm>
        </Create>
    );
};