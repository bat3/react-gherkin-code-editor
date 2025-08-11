@FeatureTag1 @FeatureTag2  
Feature: My first feature
  My feature description
  The second line of my feature description

  Rule: The first rule of the feature
    The first rule description
    The second line of the first rule description

    # Background comment
    Background:
      Given a global administrator named "Greg"
      And a blog named "Greg's anti-tax rants"
      And a customer named "Dr. Bill"

    # The first Scenario has two steps
    Scenario: Only One -- One alive
      Given there is only 1 ninja alive
      Then they will live forever ;-)
      But I shouldn't see something else

    # The second Example has two steps
    Example: Only One -- More than one alive
      Given there are 3 ninjas
      And there are more than one ninja alive
      When 2 ninjas meet, they will fight
      Then one ninja dies (but not me)
      And there is one ninja less alive

  # Rule comment
  Rule: The second rule of the feature

    @ScenarioTag1 @ScenarioTag2 
    Scenario Outline: eating
      Given there are <start> cucumbers
      * a Given step with start
      When I eat <eat> cucumbers
      * a When step with start
      Then I should have <left> cucumbers
      * a Then step with start

      Examples:
        | start | eat | left |
        |    12 |   5 |    7 |
        |    20 |   5 |   15 |