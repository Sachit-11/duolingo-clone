"use client";

import { Admin, Resource } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";

import { CourseList } from "./course/list";
import { CourseCreate } from "./course/create";
import { CourseEdit } from "./course/edit";

import { UnitList } from "./unit/list";
import { UnitCreate } from "./unit/create";
import { UnitEdit } from "./unit/edit";

import { LessonList } from "./lesson/list";
import { LessonCreate } from "./lesson/create";
import { LessonEdit } from "./lesson/edit";

import { ChallengeList } from "./challenge/list";
import { ChallengeCreate } from "./challenge/create";
import { ChallengeEdit } from "./challenge/edit";

import { ChallengeOptionList } from "./challengeOption/list";
import { ChallengeOptionCreate } from "./challengeOption/create";
import { ChallengeOptionEdit } from "./challengeOption/edit";

// "/api" is the base URL of the REST API
const dataProvider = simpleRestProvider("/api");

const App = () => {
    return(
        <Admin dataProvider = {dataProvider}>
            <Resource
                name = "courses" // appended to the base URL
                list = {CourseList}
                create = {CourseCreate}
                edit = {CourseEdit}
            />
            <Resource
                name = "units"
                list = {UnitList}
                create = {UnitCreate}
                edit = {UnitEdit}
            />
            <Resource
                name = "lessons"
                list = {LessonList}
                create = {LessonCreate}
                edit = {LessonEdit}
            />
            <Resource
                name = "challenges"
                list = {ChallengeList}
                create = {ChallengeCreate}
                edit = {ChallengeEdit}
                // recordRepresentation specifies the field to display in the references field in the list & edit view
                // Note that challengeId is still being used as the reference field but the value displayed is the question field
                recordRepresentation = "question"
            />
            <Resource
                name = "challengeOptions"
                list = {ChallengeOptionList}
                create = {ChallengeOptionCreate}
                edit = {ChallengeOptionEdit}
                options = {{ label: "Challenge Options" }}
            />
        </Admin>
    );
}

export default App;