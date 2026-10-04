module MainTest exposing (suite)

import Expect
import Json.Encode as E
import Main
import Test exposing (Test, describe, test)
import Test.Html.Query as Query
import Test.Html.Selector exposing (tag, text)


render : E.Value -> Query.Single Main.Msg
render flags =
    Main.init flags |> Tuple.first |> Main.view |> Query.fromHtml


validConfig : E.Value
validConfig =
    E.object
        [ ( "startCells", E.int 4 )
        , ( "epochs", E.int 10 )
        , ( "splitChance", E.float 1 )
        , ( "splitPeriod", E.float 2 )
        ]


{-| Renders the page after the simulation reports `progress`.
-}
renderAfter : { epoch : Int, total : Int, marked : Int } -> E.Value -> Query.Single Main.Msg
renderAfter progress flags =
    Main.init flags
        |> Tuple.first
        |> Main.update (Main.EpochChanged progress)
        |> Tuple.first
        |> Main.view
        |> Query.fromHtml


suite : Test
suite =
    describe "Main"
        [ test "names the page" <|
            \_ -> Expect.equal "Growth Cells" Main.title
        , test "shows the largest population for a valid config" <|
            \_ ->
                render validConfig
                    |> Query.has [ text "Up to 4096 cells" ]
        , test "starts at epoch 0 with the starting cells" <|
            \_ ->
                render validConfig
                    |> Query.has [ text "Epoch 0 · 4 cells" ]
        , test "shows the progress the simulation reports" <|
            \_ ->
                renderAfter { epoch = 3, total = 32, marked = 0 } validConfig
                    |> Query.has [ text "Epoch 3 · 32 cells" ]
        , test "ignores progress while the config is invalid" <|
            \_ ->
                renderAfter { epoch = 3, total = 32, marked = 0 } (E.object [])
                    |> Query.findAll [ tag "li" ]
                    |> Query.count (Expect.equal 4)
        , test "lists every problem in an invalid config" <|
            \_ ->
                render (E.object [])
                    |> Query.findAll [ tag "li" ]
                    |> Query.count (Expect.equal 4)
        ]
